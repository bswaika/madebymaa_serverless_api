const { Order, Seller } = require('../../models');
const STATUS = require('../../statuscodes');

const updateSellerRating = async(sellerID) => {
    let response;
    try {
        const sellerOrders = await Order.find({ sellerID: sellerID, rating: { $gt: 0 } }).select('rating').lean();
        let total = 0;
        let count = sellerOrders.length;

        if (count > 0) {
            for (const { rating }
                of sellerOrders) {
                total += rating;
            }
            await Seller.findOneAndUpdate({ firebaseID: sellerID }, {
                rating: (total / count)
            }, {
                new: true,
                runValidators: true
            });
            response = {
                status: 200,
                message: 'Order rating submitted successfully...'
            };
            return response;
        }
        throw new Error('NoRatingsFoundError');

    } catch (err) {
        response = {
            status: 500,
            message: 'Internal Server Error...',
            debugInfo: err.message
        };
        if (err.message == 'NoRatingsFoundError')
            response = {
                status: 404,
                message: 'No Ratings found...'
            };
        return response;
    }
}

const rate = async(req, res) => {
    const session = await Order.startSession();
    try {
        session.startTransaction();
        const order = await Order.findById(req.params.orderId).session(session);
        if (order.status == STATUS.ORDER_DELIVERED && order.userID == req.entity.firebaseID) {

            order.rating = req.body.rating;
            await order.save();

        }

        await session.commitTransaction();
        session.endSession();

        const { status, ...response } = await updateSellerRating(order.sellerID);


        return res.status(status).json(response);

    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({
            message: 'Internal Server Error...',
            debugInfo: err.message
        });
    }
}

module.exports = rate;