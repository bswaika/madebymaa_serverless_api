const { Dish, User } = require('../../models');

const add = async(req, res) => {
    try {
        const dishId = req.params.dishId;
        const user = await User.findOne({ firebaseID: req.uid }).select('-__v -createdAt -updatedAt');
        if (!user) {
            return res.status(404).json({
                message: 'No User found...'
            });
        }
        const { cart } = user;
        const itemIndex = cart.items.findIndex(item => item.dishID == dishId);
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity = cart.items[itemIndex].quantity + 1;
        } else {
            const dish = await Dish.findById(dishId).select('_id name sellerID price');
            if (!dish) {
                return res.status(404).json({
                    message: 'Dish not found in DB...'
                });
            }
            if (cart.items.length > 0) {
                const sellerID = cart.items[0].sellerID;
                if (dish.sellerID != sellerID) {
                    return res.status(400).json({
                        message: 'Bad Request. Item not from same seller...'
                    });
                }
            }
            cart.items.push({
                dishID: dish._id,
                quantity: 1,
                name: dish.name,
                price: dish.price,
                sellerID: dish.sellerID
            });
        }
        user.cart = cart;
        await user.save();
        return res.status(200).json({
            message: 'Successfully added to cart...',
            sellerID: user.cart.items[0].sellerID,
            itemCount: user.cart.items.length
        });
    } catch (err) {
        return res.status(500).json({
            message: 'DB error...',
            debugInfo: err.message
        });
    }
}

module.exports = add;