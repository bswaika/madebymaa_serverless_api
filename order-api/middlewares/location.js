const { User } = require('../models');

const getUserLocation = async(req, res, next) => {
    try {
        const user = await User.findOne({ firebaseID: req.uid }).select('-__v -createdAt -updatedAt');
        if (!user) {
            return res.status(404).json({
                message: 'No user found...'
            });
        }
        if (!user.location) {
            return res.status(400).json({
                message: 'No user location found. Kindly register address...'
            });
        }
        req.location = user.location;
        next();
    } catch (err) {
        return res.status(500).json({
            message: 'DB error...',
            debugInfo: err.message
        });
    }
}

module.exports = getUserLocation;