const { Order } = require('../models');
const { RZP } = require('../providers');
const STATUS = require('../statuscodes');

// Call this every 4 minutes
// Order Hold Period : 4-8 minutes

const cancelOrdersIfNotPaidByUser = async(event, context) => {
    console.log(`=========Starting COINPBU @ Time: ${Date.now()}`);
    try {
        console.log('Fetching Orders...');
        const orders = await Order.find({
            status: STATUS.ORDER_CREATED,
            createdAt: {
                $lt: new Date(new Date(Date.now() - 4 * 60 * 1000).toISOString())
            }
        });
        console.log('Validating and Cancelling Orders...');
        for (const order of orders) {
            console.log('---------------------------------');
            if (await RZP.isPaidOrder(order.orderID).catch(console.log)) {
                const refunds = await RZP.refundOrder(order.orderID).catch(console.log);
                if (refunds.length > 0) {
                    console.log(`${order._id} Refund Initiated...`);
                }
            }
            order.status = STATUS.ORDER_CANCELLED;
            await order.save();
            console.log(`${order._id} Cancelled...`);
            console.log('---------------------------------');
        }
        console.log(`=========Stopping COINPBU @ Time: ${Date.now()} | Processed ${orders.length} orders...`);
        return;
    } catch (err) {
        console.log(err);
        return;
    }
}

module.exports = cancelOrdersIfNotPaidByUser;