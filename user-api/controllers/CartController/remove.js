const { User } = require('../../models');

const removeAll = async(req, res) => {
    try {
        const user = await User.findOne({ firebaseID: req.uid }).select('-__v -createdAt -updatedAt');
        if (!user) {
            return res.status(404).json({
                message: 'No User found...'
            });
        }
        user.cart.items = [];
        await user.save();
        return res.status(200).json({
            message: 'Cart reset successfully...'
        });
    } catch (err) {
        return res.status(500).json({
            message: 'DB error...',
            debugInfo: err.message
        });
    }
}

const removeOne = async(req, res) => {
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
            if (cart.items[itemIndex].quantity > 1) {
                cart.items[itemIndex].quantity = cart.items[itemIndex].quantity - 1;
            } else {
                cart.items.splice(itemIndex, 1);
            }
            user.cart = cart;
            await user.save();
            return res.status(200).json({
                message: 'Successfully removed from cart...',
                itemCount: user.cart.items.length
            });
        } else {
            return res.status(404).json({
                message: 'Could not find dish in cart...'
            });
        }
    } catch (err) {
        return res.status(500).json({
            message: 'DB error...',
            debugInfo: err.message
        });
    }
}

module.exports = {
    removeAll,
    removeOne
}