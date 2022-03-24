const Razorpay = require('razorpay');
const { createHmac } = require('crypto');
const { RZP_KEY_ID, RZP_KEY_SECRET } = require('../config/razorpay');

const gateway = new Razorpay({
    key_id: RZP_KEY_ID,
    key_secret: RZP_KEY_SECRET
});

const createOrder = async({ amount, currency, receipt }) =>
    await gateway.orders.create({ amount, currency, receipt, notes: { for: `MadeByMaa::Order::${receipt}` } });

const fetchPayment = async(payment_id) => {
    console.log(payment_id)
    return await gateway.payments.fetch(payment_id)
}


const isValidSignature = ({ order_id, payment_id, signature }) => {
    const hash = createHmac('sha256', RZP_KEY_SECRET)
        .update(`${order_id}|${payment_id}`)
        .digest('hex');
    return signature == hash;
}

const isPaidOrder = async(order_id) => {
    try {
        const order = await gateway.orders.fetch(order_id);
        if (order.amount_paid == 0) {
            return false;
        }
        return true;
    } catch (err) {
        return err;
    }
}

const refundOrder = async(order_id) => {
    try {
        const payments = await gateway.orders.fetchPayments(order_id);
        // console.log(payments);
        if (payments.count && payments.count > 0) {
            const refunds = [];
            for (const payment of payments.items) {
                if (payment.status == 'captured') {
                    const refund = await gateway.payments.refund(payment.id, {
                            amount: payment.amount,
                            notes: {
                                for: `MadeByMaa::RZPOrderReference::${order_id}`
                            }
                        })
                        .catch(console.log);
                    // console.log(refund);
                    refunds.push(refund);
                }
            };
            return refunds;
        }
        return;
    } catch (err) {
        return err;
    }
}

const splitPayment = async({ payment_id, params }) => {
    try {
        const payment = await gateway.payments.fetch(payment_id);
        if (payment.status == 'captured') {
            console.log(params);
            //const result = await gateway.transfers.create({...params });
            const result = await gateway.payments.transfer(payment_id, { transfers: [params] });
            console.log(result);
            return true;
        }
        return false;
    } catch (err) {
        console.log(err);
        return false;
    }
}

module.exports = {
    createOrder,
    fetchPayment,
    isValidSignature,
    isPaidOrder,
    refundOrder,
    splitPayment
}