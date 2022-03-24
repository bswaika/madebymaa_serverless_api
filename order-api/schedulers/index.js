const cancelOrdersIfNotAcceptedByKitchen = require('./cancelOrdersIfNotAcceptedByKitchen');
const cancelOrdersIfNotPaidByUser = require('./cancelOrdersIfNotPaidByUser');
const splitOrderRevenueIfDelivered = require('./splitOrderRevenueIfDelivered');

module.exports = {
    cancelOrdersIfNotAcceptedByKitchen,
    cancelOrdersIfNotPaidByUser,
    splitOrderRevenueIfDelivered
}