const { Order, Token, Partner } = require('../../models');
const { FCM } = require('../../providers');
const STATUS = require('../../statuscodes');

// TODO: Need to add broadcasting FCM to delivery partners
// First need to query Partner model with status: true (online) and assignedToOrder: false (not on active order) with limit 10
// Then Query Tokens to find those 10 tokens and broadcast to them, otherwise give a retry Link

const prepare = async(req, res) => {
    const session = await Order.startSession();
    try {
        session.startTransaction();
        const order = await Order.findById(req.params.orderId).session(session);
        if (order.status == STATUS.RESTAUTANT_CONFIRMED && order.sellerID == req.entity.firebaseID) {
            order.status = STATUS.AWAITING_DELIVERY_PARTNER;
            await order.save();
        }
        await session.commitTransaction();
        session.endSession();

        const userToken = await Token.findOne({ firebaseID: order.userID, entity: 'user' })
            .catch(err => {
                return res.status(500).json({
                    message: 'DB Error...',
                    debugInfo: err.message
                });
            });
        if (!userToken) {
            return res.status(404).json({
                message: 'FCM Token not found. Could not communicate with User...'
            });
        }

        const { token } = userToken;

        const result = await FCM.broadcast({ title: 'Order Prepared', body: 'Tap to view details...' }, [token])
            .catch(err => {
                return res.status(500).json({
                    message: 'FCM notification failed to send...',
                    retryPath: `/seller/notify/${token}`,
                    auth: true,
                    notification: {
                        title: 'Order Prepared',
                        body: 'Tap to view details...'
                    }
                });
            });

        const partners = await Partner.find({ onlineStatus: true, verifiedStatus: true }).select('name firebaseID phone').limit(20).lean()
            .catch(err => {
                return res.status(500).json({
                    message: 'DB Error...',
                    debugInfo: err.message
                });
            });

        if (!partners.length) {
            return res.status(404).json({
                message: 'No available partners. Please retry in some time...'
            });
        }

        let tokens = await Promise.all(partners.map(async(partner) => {
            const partnerToken = await Token.findOne({ firebaseID: partner.firebaseID, entity: 'partner' });

            if (!partnerToken) {
                return null;
            }

            return partnerToken.token;
        })).catch(err => {
            return res.status(500).json({
                message: 'DB Error...',
                debugInfo: err.message
            });
        });

        tokens = tokens.filter((token) => token != null);

        const response = await FCM.broadcast({ title: 'New Order', body: 'Tap to view details...' }, tokens)
            .catch(err => {
                return res.status(500).json({
                    message: 'FCM notification failed to send...',
                    retryPath: `/seller/broadcast`,
                    auth: true,
                    notification: {
                        title: 'New Order',
                        body: 'Tap to view details...',
                        tokens
                    }
                });
            });
        if (response.successCount && result) {
            return res.status(200).json({
                message: 'Order prepared successfully. Waiting for a delivery partner to arrive...',
                body: {
                    order
                }
            });
        }

        return res.status(500).json({
            message: 'Order prepared successfully. FCM Communication problem...',
            body: {
                order
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

module.exports = prepare;