const { Dish } = require('../../models');

const remove = async(req, res) => {
    try {
        const dish = await Dish.findOneAndDelete({ sellerID: req.uid, _id: req.params.id });

        if (!dish) {
            return res.status(404).json({
                message: 'No Dish found with requested ID...'
            });
        }

        return res.status(200).json({
            message: 'Dish deleted successfully...'
        });
    } catch (err) {
        return res.status(500).json({
            message: 'DB error...',
            debugInfo: err.message
        });
    }
}

module.exports = remove;