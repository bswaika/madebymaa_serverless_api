const { Order, Token } = require('../../models');
const { FCM } = require('../../providers');
const STATUS = require('../../statuscodes');

// TODO: Need to add broadcasting FCM to delivery partners
// First need to query Partner model with status: true (online) and assignedToOrder: false (not on active order) with limit 10
// Then Query Tokens to find those 10 tokens and broadcast to them, otherwise give a retry Link

const assign = async(req, res) => {
    const session = await Order.startSession();
    try {
        session.startTransaction();
        const order = await Order.findById(req.params.orderId).session(session);
        if (order.status == STATUS.AWAITING_DELIVERY_PARTNER && !order.partnerID) {
            order.partnerID = req.entity.firebaseID;
            order.status = STATUS.PARTNER_CONFIRMED;
            await order.save();
        }
        await session.commitTransaction();
        session.endSession();

        if (order.partnerID != req.entity.firebaseID) {
            throw new Error('Partner already assigned...');
        }

        let tokens = [];
        const user = await Token.findOne({ firebaseID: order.userID, entity: 'user' })
            .catch(err => {
                return res.status(500).json({
                    message: 'DB Error...',
                    debugInfo: err.message
                });
            });
        if (!user) {
            return res.status(404).json({
                message: 'FCM Token not found. Could not communicate with User...'
            });
        }

        const { token: userToken } = user;

        const seller = await Token.findOne({ firebaseID: order.sellerID, entity: 'seller' })
            .catch(err => {
                return res.status(500).json({
                    message: 'DB Error...',
                    debugInfo: err.message
                });
            });
        if (!seller) {
            return res.status(404).json({
                message: 'FCM Token not found. Could not communicate with Seller...'
            });
        }

        const { token: sellerToken } = seller;

        tokens.push(userToken);
        tokens.push(sellerToken);

        const response = await FCM.broadcast({ title: 'Partner Assigned', body: 'Tap to view details...' }, tokens)
            .catch(err => {
                return res.status(500).json({
                    message: 'FCM notification failed to send...',
                    retryPath: `/partner/broadcast`,
                    auth: true,
                    notification: {
                        title: 'Partner Assigned',
                        body: 'Tap to view details...',
                        tokens
                    }
                });
            });

        if (response.successCount == 2) {
            return res.status(200).json({
                message: 'Order assigned successfully...',
                body: {
                    order
                }
            });
        }

        return res.status(500).json({
            message: 'Order assigned successfully. FCM Communication problem...',
            body: {
                order
            },
            retryPath: `/partner/broadcast`,
            auth: true,
            notification: {
                title: 'Partner Assigned',
                body: 'Tap to view details...',
                tokens
            }
        });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({
            message: 'Internal Server Error...',
            debugInfo: err.message
        });
    }
}

module.exports = assign;