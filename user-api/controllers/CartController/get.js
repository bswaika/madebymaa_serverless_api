const { User, Dish, Env } = require('../../models');

// const DELIVERY_CHARGE = 25;
// const SGST = 5;
// const CGST = 5;

// TODO: Need to add a middleware here to get business 
// configurations like DELIVERY_CHARGE, GST etc

const get = async(req, res) => {
    try {
        const DELIVERY_CHARGE = await Env.findOne({ key: "DELIVERY_CHARGE" });
        const SGST = await Env.findOne({ key: "SGST" });
        const CGST = await Env.findOne({ key: "CGST" });
        if (!DELIVERY_CHARGE || !SGST || !CGST) {
            return res.status(500).json({
                message: 'Internal Server Error...'
            });
        }
        const user = await User.findOne({ firebaseID: req.uid }).select('-__v -createdAt -updatedAt');
        if (!user) {
            return res.status(404).json({
                message: 'No User found...'
            });
        }
        const { cart } = user;
        if (!cart.items.length) {
            return res.status(404).json({
                message: 'Empty cart...'
            });
        }
        const sellerID = cart.items[0].sellerID;
        const kitchenIndex = req.kitchens.findIndex((kitchen) => kitchen.firebaseID == sellerID);
        const kitchenName = kitchenIndex > -1 ? req.kitchens[kitchenIndex].kitchenName : 'Kitchen name not found';
        const bio = kitchenIndex > -1 ? req.kitchens[kitchenIndex].bio : 'Kitchen bio not found';
        const avatar = kitchenIndex > -1 ? req.kitchens[kitchenIndex].avatar : 'Kitchen avatar not found';
        const rating = kitchenIndex > -1 ? req.kitchens[kitchenIndex].rating : 'Kitchen rating not found';
        const inRange = kitchenIndex > -1 ? true : false;
        const isOnline = kitchenIndex > -1 ? req.kitchens[kitchenIndex].kitchenStatus : false;
        let total = 0;
        const items = await Promise.all(cart.items.map(async(item) => {
            const { name, price, dishID, quantity } = item
            const { imageURL, type, category, description, availability, schedule } = await Dish.findById(dishID).select('imageURL type category description availability schedule');
            const amt = item.price * item.quantity;
            total += amt;
            return {
                name,
                price,
                dishID,
                quantity,
                imageURL,
                amount: amt,
                type,
                category,
                description,
                availability,
                schedule
            }
        }));
        const sgst = Math.ceil(total * (SGST.value / 100));
        const tax = {
            sgst,
            cgst: Math.ceil((total + sgst) * (CGST.value / 100))
        }
        const net = total + tax.sgst + tax.cgst + DELIVERY_CHARGE.value;
        const bill = {
            items,
            total: total,
            deliveryCharge: DELIVERY_CHARGE.value,
            tax,
            net,
            inRange,
            isOnline
        };
        return res.status(200).json({
            message: 'Cart fetched successfully',
            body: {
                cart: {
                    sellerID,
                    kitchenName,
                    bill,
                    bio,
                    avatar,
                    rating
                }
            }
        });
    } catch (err) {
        return res.status(500).json({
            message: 'DB error...',
            debugInfo: err.message
        });
    }
}

module.exports = get;