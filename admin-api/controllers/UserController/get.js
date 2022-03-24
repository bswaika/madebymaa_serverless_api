const { User } = require('../../models');

const get = async(req, res) => {
    try {
        // console.log(req.uid);
        const user = await User.findOne({ firebaseID: req.params.userId }).select('-__v -createdAt -updatedAt');

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

const getAll = async(req, res) => {
    try {
        // console.log(req.uid);
        const users = await User.find({}).sort('-createdAt').select('-__v -createdAt -updatedAt');

        if (!users.length) {
            return res.status(404).json({
                message: 'No Users found...'
            });
        }

        return res.status(200).json({
            message: 'User information fetched successfully...',
            body: {
                users,
                count: users.length
            }
        });
    } catch (err) {
        return res.status(500).json({
            message: 'DB error...',
            debugInfo: err.message
        });
    }
}

module.exports = {
    get,
    getAll
};