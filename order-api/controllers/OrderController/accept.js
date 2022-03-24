const { Order, Token } = require('../../models');
const { FCM } = require('../../providers');
const STATUS = require('../../statuscodes');


const accept = async(req, res) => {
    const session = await Order.startSession();
    try {
        session.startTransaction();
        const order = await Order.findById(req.params.orderId).session(session);
        if (order.status == STATUS.AWAITING_CONFIRMATION && order.sellerID == req.entity.firebaseID) {
            order.status = STATUS.RESTAUTANT_CONFIRMED;
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

        const result = await FCM.broadcast({ title: 'Order Confirmed', body: 'Tap to view details...' }, [token])
            .catch(err => {
                return res.status(500).json({
                    message: 'FCM notification failed to send...',
                    retryPath: `/seller/notify/${token}`,
                    auth: true,
                    notification: {
                        title: 'Order Confirmed',
                        body: 'Tap to view details...'
                    }
                });
            });


        if (result) {
            return res.status(200).json({
                message: 'Order confirmed successfully. Waiting for Home Chef to prepare your food...',
                body: {
                    order
                }
            });
        }
        return res.status(500).json({
            message: 'Order confirmed successfully. FCM Communication problem...',
            body: {
                order
            },
            retryPath: `/seller/notify/${token}`,
            auth: true,
            notification: {
                title: 'Order Confirmed',
                body: 'Tap to view details...'
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

module.exports = accept;