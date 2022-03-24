const { Dish } = require('../../models');

const create = async(req, res) => {
    req.body.sellerID = req.uid;
    try {
        const dish = await Dish.create(req.body);
        return res.status(201).json({
            message: 'Dish created successfully...',
            body: {
                dish
            }
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Dish could not be created...',
            debugInfo: error.message
        });
    }
}

module.exports = create;