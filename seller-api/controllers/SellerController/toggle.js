const { Seller } = require('../../models');

const toggleKitchenStatus = async(req, res) => {
    try {

        const seller = await Seller.findOne({ firebaseID: req.uid }).select('-__v -createdAt -updatedAt');

        if (!seller) {
            return res.status(404).json({
                message: 'No Seller found with requested FirebaseID...'
            });
        }

        seller.kitchenStatus = !seller.kitchenStatus;
        await seller.save();

        return res.status(200).json({
            message: 'Seller status toggled successfully...',
            body: {
                seller
            }
        });
    } catch (err) {
        return res.status(500).json({
            message: 'DB error...',
            debugInfo: err.message
        });
    }
}

module.exports = toggleKitchenStatus;