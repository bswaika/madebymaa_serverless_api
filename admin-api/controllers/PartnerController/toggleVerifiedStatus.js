const { Partner } = require('../../models');

const toggleVerifiedStatus = async(req, res) => {
    try {

        const partner = await Partner.findOne({ firebaseID: req.params.partnerId }).select('-__v -createdAt -updatedAt');

        if (!partner) {
            return res.status(404).json({
                message: 'No Partner found with requested FirebaseID...'
            });
        }

        partner.verifiedStatus = !partner.verifiedStatus;
        await partner.save();

        return res.status(200).json({
            message: 'Partner information updated successfully...',
            body: {
                partner
            }
        });
    } catch (err) {
        return res.status(500).json({
            message: 'DB error...',
            debugInfo: err.message
        });
    }
}

module.exports = toggleVerifiedStatus;