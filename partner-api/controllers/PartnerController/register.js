const { Partner } = require('../../models');

const register = async(req, res) => {
    try {
        const partner = await Partner.create(req.body);
        partner.verifiedStatus = false;
        await partner.save();
        return res.status(201).json({
            message: 'Partner registered successfully...',
            body: {
                partner
            }
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Partner could not be registered...',
            debugInfo: error.message
        });
    }
}

module.exports = register;