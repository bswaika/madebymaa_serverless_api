const { Order } = require('../../models');
const STATUS = require('../../statuscodes');

const get = async(req, res) => {
    try {
        const order = await Order.findOne({ partnerID: req.params.partnerId, _id: req.params.orderId });

        if (!order) {
            return res.status(404).json({
                message: 'No Order found with requested ID...'
            });
        }

        return res.status(200).json({
            message: 'Order information fetched successfully...',
            body: {
                order
            }
        });
    } catch (err) {
        return res.status(500).json({
            message: 'DB error...',
            debugInfo: err.message
        });
    }
}

const getAll = async(req, res) => {
    try {
        const orders = await Order.find({ partnerID: req.params.partnerId, status: STATUS.ORDER_DELIVERED });

        if (!orders) {
            return res.status(404).json({
                message: 'No Orders with this Partner...'
            });
        }

        return res.status(200).json({
            message: 'Order information fetched successfully...',
            body: {
                orders,
                count: orders.length
            }
        });
    } catch (err) {
        return res.status(500).json({
            message: 'DB error...',
            debugInfo: err.message
        });
    }
}

module.exports = {
    get,
    getAll
};