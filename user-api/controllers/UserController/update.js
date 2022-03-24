const { User } = require('../../models');

const update = async(req, res) => {
    try {
        if (req.body.cart || req.body.firebaseID) {
            return res.status(401).json({
                message: 'Unauthorized Request. Requires ADMIN permissions to update firebaseID. Requires CART route for updating cart...'
            });
        } else {
            const user = await User.findOneAndUpdate({ firebaseID: req.uid }, req.body, {
                new: true,
                runValidators: true
            }).select('-__v -createdAt -updatedAt');

            if (!user) {
                return res.status(404).json({
                    message: 'No User found with requested FirebaseID...'
                });
            }

            return res.status(200).json({
                message: 'User information updated successfully...',
                body: {
                    user
                }
            });
        }
    } catch (err) {
        return res.status(500).json({
            message: 'DB error...',
            debugInfo: err.message
        });
    }
}

module.exports = update;