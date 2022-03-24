const { User } = require('../../models');

const remove = async(req, res) => {
    try {

        const user = await User.findOneAndDelete({ firebaseID: req.uid });

        if (!user) {
            return res.status(404).json({
                message: 'No User found with requested FirebaseID...'
            });
        }

        // MAY NEED TO ADDRESS S3 AVATAR UPLOADS
        // CHECK SNS AS WELL TO SEE IF PUBLISHING AN EVENT
        // CAN TRIGGER ANOTHER LAMBDA TO HANDLE THE SAME

        return res.status(200).json({
            message: 'User deleted successfully...'
        });
    } catch (err) {
        return res.status(500).json({
            message: 'DB error...',
            debugInfo: err.message
        });
    }
}

module.exports = remove;