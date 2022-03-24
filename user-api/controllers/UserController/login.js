const { User } = require('../../models');

const login = async(req, res) => {
    try {
        const user = await User.findOne({ firebaseID: req.uid }).select('-__v -createdAt -updatedAt');
        if (!user) {
            return res.status(404).json({
                message: 'User not yet registered...'
            });
        }
        return res.status(200).json({
            message: 'User logged in...',
            body: {
                user
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