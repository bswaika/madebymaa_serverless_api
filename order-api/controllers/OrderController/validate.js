const { Order, Token } = require('../../models');
const { RZP, FCM } = require('../../providers');
const { orderValidateSchema } = require('../../validators');
const STATUS = require('../../statuscodes');

const validate = async(req, res) => {
    const { error, value } = orderValidateSchema.validate(req.body);
    if (error || !req.params.orderId) {
        return res.status(400).json({
            message: 'Bad Request. Validation Error...',
            debugInfo: error || 'Route Parameter expected'
        });
    }
    const session = await Order.startSession();
    try {
        session.startTransaction();
        const { razorpay_payment_id, razorpay_signature } = value
        const order = await Order.findById(req.params.orderId).session(session);
        if (!RZP.isValidSignature({
                order_id: order.orderID,
                payment_id: razorpay_payment_id,
                signature: razorpay_signature
            })) {
            throw new Error('Signature does not match. Please verify payment source...');
        }

        const payment = await RZP.fetchPayment(razorpay_payment_id);
        console.log(order, payment)

        if (payment.amount == order.bill.net * 100 && order.status == STATUS.ORDER_CREATED && order.userID == req.entity.firebaseID) {

            order.status = STATUS.AWAITING_CONFIRMATION;
            order.paymentID = razorpay_payment_id;
            await order.save();

            await session.commitTransaction();
            session.endSession();

            console.log(order);

            const sellerToken = await Token.findOne({ firebaseID: order.sellerID, entity: 'seller' })
                .catch(err => {
                    return res.status(500).json({
                        message: 'DB Error...',
                        debugInfo: err.message
                    });
                });
            if (!sellerToken) {
                return res.status(404).json({
                    message: 'FCM Token not found. Could not communicate with Seller...'
                });
            }

            const { token } = sellerToken;
            console.log(token);

            const result = await FCM.broadcast({ title: 'New Order Arrived', body: 'Tap to view details...' }, [token])
                .catch(err => {
                    return res.status(500).json({
                        message: 'FCM notification failed to send...',
                        retryPath: `/user/notify/${token}`,
                        auth: true,
                        notification: {
                            title: 'New Order Arrived',
                            body: 'Tap to view details...'
                        }
                    });
                });
            if (result) {
                return res.status(200).json({
                    message: 'Order validated successfully. Awaiting confirmation from Home Chef...',
                    body: {
                        order
                    }
                });
            }

            return res.status(500).json({
                message: 'FCM notification failed to send...',
                retryPath: `/user/notify/${token}`,
                auth: true,
                notification: {
                    title: 'New Order Arrived',
                    body: 'Tap to view details...'
                }
            });
        }

        throw new Error('Payment Validation Error...');
    } catch (err) {
        console.log(JSON.stringify(err));
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({
            message: 'Internal Server Error...',
            debugInfo: err.message
        });
    }
}

module.exports = validate;