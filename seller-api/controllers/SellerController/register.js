const { Seller } = require('../../models');

const register = async(req, res) => {
    try {
        const seller = await Seller.create(req.body);
        seller.verifiedStatus = false;
        await seller.save();
        return res.status(201).json({
            message: 'Seller registered successfully...',
            body: {
                seller
            }
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Seller could not be registered...',
            debugInfo: error.message
        });
    }
}

module.exports = register;