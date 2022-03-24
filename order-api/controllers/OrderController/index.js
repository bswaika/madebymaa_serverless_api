const accept = require('./accept');
const create = require('./create');
const prepare = require('./prepare');
const validate = require('./validate');
const authorize = require('./authorize');
const handleGet = require('./handleGet');
const assign = require('./assign');
const pickup = require('./pickup');
const deliver = require('./deliver');
const rate = require('./rate');

module.exports = {
    authorize,
    handleGet,
    accept,
    create,
    prepare,
    validate,
    assign,
    pickup,
    deliver,
    rate
}

// create: async(req, res) => {
//     // Create a order in table with status = ORDER_PLACED
//     // const order = Order.create({
//     //    sellerID: '',
//     //    userID: req.entity.firebaseID,
//     //    items: req.body.cart.items,
//     //    finances: {
//     //      total:
//     //      tax: {
//     //          sgst:
//     //          cgst:
//     //        },
//     //      deliveryCharge: 
//     //      net
//     //    } = req.body.cart
//     //    status: 'ORDER_PLACED'
//     // })
//     // const { id: orderID } = await rzp.orders.create({amount: req.body.net, currency: "INR", receipt: order._id});
//     // order.orderID = orderID
//     // await order.save()
//     // return res.status(200).json({order})
//     return res.status(200).json({
//         entity: req.entity.type
//     })
// },
// handlePayment: async(req, res) => {
//     // const order = Order.findById(req.params.orderId);
//     // const { razorpay_payment_id: paymentID, razorpay_signature: signature } = req.body;
//     // const transaction = Crypto.createHmac('SHA-256', API_KEY).update(`${order.orderID}|${paymentID}`).digest('hex');
//     // if (transaction == signature) {
//     //     order.paymentID = paymentID;
//     //     order.signature = signature;
//     //     order.status = 'AWAITING_CONFIRMATION';
//     //     await order.save();
//     // EMIT FCM to SELLER
//     //     MOVE THIS TO THE ORDER DELIVERED CONTROLLER THAT RUNS TO CAPTURE AND SPLIT PAYMENTS
//     //  const { status } = rzp.payments.capture(order.paymentID, order.finances.net, "INR");
//     //     if (status == 'captured') {

//     //         return res.status(200).json({
//     //             order
//     //         })
//     //     }
//     //     return res.status(500).json({
//     //         message: 'Payment could not be captured...'
//     //     })
//     // }

//     return res.status(404).json({
//         message: 'Order Not Found...'
//     })
// }