const { Partner } = require('../../models');

const update = async(req, res) => {
    try {
        if (req.body.verifiedStatus || req.body.firebaseID) {
            return res.status(401).json({
                message: 'Unauthorized Request. Requires ADMIN permissions to update verifiedStatus or firebaseID...'
            });
        } else {
            const partner = await Partner.findOneAndUpdate({ firebaseID: req.uid, verifiedStatus: false }, req.body, {
                new: true,
                runValidators: true
            }).select('-__v -createdAt -updatedAt');

            if (!partner) {
                return res.status(404).json({
                    message: 'No Partner found with requested FirebaseID or You are currently verified...'
                });
            }

            return res.status(200).json({
                message: 'Partner information updated successfully...',
                body: {
                    partner
                }
            });
        }
    } catch (err) {
        return res.status(500).json({
            message: 'DB error...',
            debugInfo: err.message
        });
    }
}

module.exports = update;