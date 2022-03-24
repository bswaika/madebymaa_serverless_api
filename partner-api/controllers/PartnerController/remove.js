const { Partner } = require('../../models');

const remove = async(req, res) => {
    try {

        const partner = await Partner.findOneAndDelete({ firebaseID: req.uid });

        if (!partner) {
            return res.status(404).json({
                message: 'No Partner found with requested FirebaseID...'
            });
        }

        // MAY NEED TO ADDRESS S3 AVATAR UPLOADS
        // CHECK SNS AS WELL TO SEE IF PUBLISHING AN EVENT
        // CAN TRIGGER ANOTHER LAMBDA TO HANDLE THE SAME

        return res.status(200).json({
            message: 'Partner deleted successfully...'
        });
    } catch (err) {
        return res.status(500).json({
            message: 'DB error...',
            debugInfo: err.message
        });
    }
}

module.exports = remove;