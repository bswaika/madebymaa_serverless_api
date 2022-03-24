const { Dish } = require('../../models');
const today = async(req, res) => {
    const week = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = week[new Date().getDay()];

    try {
        const allDishes = await Dish.find({ sellerID: req.uid }).select('-__v -createdAt -updatedAt');
        if (!allDishes) {
            return res.status(404).json({
                message: 'No Dishes found with requested Seller...'
            });
        }
        const dishes = allDishes.filter((dish) => dish.schedule[today]);
        if (!dishes) {
            return res.status(404).json({
                message: 'No Dishes found for today...'
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

module.exports = today;