const { User } = require('../../models');

const get = async(req, res) => {
    try {
        const user = await User.findOne({ firebaseID: req.uid }).select('-__v -createdAt -updatedAt');

        if (!user) {
            return res.status(404).json({
                message: 'No User found with requested FirebaseID...'
            });
        }

        return res.status(200).json({
            message: 'User information fetched successfully...',
            body: {
                user
            }
        });
    } catch (err) {
        return res.status(500).json({
            message: 'DB error...',
            debugInfo: err.message
        });
    }
}

module.exports = get;