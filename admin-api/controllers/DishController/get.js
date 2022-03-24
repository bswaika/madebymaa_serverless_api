const { Dish } = require('../../models');

const get = async(req, res) => {
    try {
        const dish = await Dish.findOne({ sellerID: req.params.sellerId, _id: req.params.dishId }).select('-__v -createdAt -updatedAt -sellerID');

        if (!dish) {
            return res.status(404).json({
                message: 'No Dish found with requested ID...'
            });
        }

        return res.status(200).json({
            message: 'Dish information fetched successfully...',
            body: {
                dish
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
        const dishes = await Dish.find({ sellerID: req.params.sellerId }).select('-__v -createdAt -updatedAt -sellerID');

        if (!dishes) {
            return res.status(404).json({
                message: 'No Dishes with this Seller...'
            });
        }

        return res.status(200).json({
            message: 'Dish information fetched successfully...',
            body: {
                dishes,
                count: dishes.length
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