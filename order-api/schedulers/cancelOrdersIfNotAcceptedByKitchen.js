const { Order, Token } = require('../models');
const { RZP, FCM } = require('../providers');
const STATUS = require('../statuscodes');

// Call this every 2 minutes
// Order Confirmation Period : 2-4 minutes

const cancelOrdersIfNotAcceptedByKitchen = async(event, context) => {
    console.log(`=========Starting COINABK @ Time: ${Date.now()}`);
    try {
        console.log('Fetching Orders...');
        const orders = await Order.find({
            status: STATUS.AWAITING_CONFIRMATION,
            createdAt: {
                $lt: new Date(new Date(Date.now() - 2 * 60 * 1000).toISOString())
            }
        });
        console.log('Validating and Cancelling Orders...');
        const tokens = [];
        for (const order of orders) {
            console.log('---------------------------------');
            if (await RZP.isPaidOrder(order.orderID).catch(console.log)) {
                const refunds = await RZP.refundOrder(order.orderID).catch(console.log);
                if (refunds.length > 0) {
                    console.log(`${order._id} Refund Initiated...`);
                }
            }
            const userToken = await Token.findOne({ firebaseID: order.userID, entity: 'user' }).select('token').lean().catch(console.log);
            if (userToken)
                tokens.push(userToken.token);
            order.status = STATUS.ORDER_CANCELLED;
            await order.save();
            console.log(`${order._id} Cancelled...`);
            console.log('---------------------------------');
        }
        if (tokens.length > 0) {
            const result = await FCM.broadcast({
                title: 'Order Cancelled',
                body: 'Home Chef did not confirm your order. Refund initiated for any already made payment...'
            }, tokens);
            if (result.successCount > 0) console.log(`${result.successCount} Users Notified...`)
        }
        console.log(`=========Stopping COINABK @ Time: ${Date.now()} | Processed ${orders.length} orders...`);
        return;
    } catch (err) {
        console.log(err);
        return;
    }
}

module.exports = cancelOrdersIfNotAcceptedByKitchen;