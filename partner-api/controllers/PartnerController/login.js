const { Partner } = require('../../models');

const login = async(req, res) => {
    try {
        const partner = await Partner.findOne({ firebaseID: req.uid }).select('-__v -createdAt -updatedAt');
        if (!partner) {
            return res.status(404).json({
                message: 'Partner not yet registered...'
            });
        }
        return res.status(200).json({
            message: 'Partner logged in...',
            body: {
                partner
            }
        });
    } catch (error) {
        return res.status(500).json({
            message: 'DB error...',
            debuginfo: error.message
        });
    }

}

module.exports = login;