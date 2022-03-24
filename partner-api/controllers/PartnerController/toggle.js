const { Partner } = require('../../models');

const togglePartnerStatus = async(req, res) => {
    try {

        const partner = await Partner.findOne({ firebaseID: req.uid }).select('-__v -createdAt -updatedAt');

        if (!partner) {
            return res.status(404).json({
                message: 'No Partner found with requested FirebaseID...'
            });
        }

        partner.onlineStatus = !partner.onlineStatus;
        await partner.save();

        return res.status(200).json({
            message: 'Partner status toggled successfully...',
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

module.exports = togglePartnerStatus;