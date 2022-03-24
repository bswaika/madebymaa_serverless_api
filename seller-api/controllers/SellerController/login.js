const { Seller } = require('../../models');

const login = async(req, res) => {
    try {
        const seller = await Seller.findOne({ firebaseID: req.uid }).select('-__v -createdAt -updatedAt');
        if (!seller) {
            return res.status(404).json({
                message: 'Seller not yet registered...'
            });
        }
        return res.status(200).json({
            message: 'Seller logged in...',
            body: {
                seller
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