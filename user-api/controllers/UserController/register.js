const { User } = require('../../models');

const register = async(req, res) => {
    try {
        const user = await User.create(req.body);
        user.cart = {
            items: [],
            active: true
        };
        await user.save();
        return res.status(201).json({
            message: 'User registered successfully...',
            body: {
                user
            }
        });
    } catch (error) {
        return res.status(500).json({
            message: 'User could not be registered...',
            debugInfo: error.message
        });
    }
}

module.exports = register;