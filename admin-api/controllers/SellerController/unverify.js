const { Seller } = require('../../models');

const unverify = async(req, res) => {
    try {
        const seller = await Seller.findOne({ firebaseID: req.params.sellerId }).select('-__v -createdAt -updatedAt');
        if (!seller) {
            return res.status(404).json({
                message: 'No Seller found with requested FirebaseID...'
            });
        }

        if (seller.verifiedStatus) {
            seller.verifiedStatus = false;
            await seller.save();
            return res.status(200).json({
                message: 'Seller information updated successfully...',
                body: {
                    seller
                }
            });
        }

        return res.status(200).json({
            message: 'Seller is already not verified...',
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

module.exports = unverify;