const { Dish } = require('../../models');

const update = async(req, res) => {
    try {

        const dish = await Dish.findOneAndUpdate({ sellerID: req.uid, _id: req.params.id }, req.body, {
            new: true,
            runValidators: true
        }).select('-__v -createdAt -updatedAt');

        if (!dish) {
            return res.status(404).json({
                message: 'No Dish found with requested ID...'
            });
        }

        return res.status(200).json({
            message: 'Dish information updated successfully...',
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

module.exports = update;