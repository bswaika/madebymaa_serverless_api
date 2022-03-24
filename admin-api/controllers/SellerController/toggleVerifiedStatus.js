const { Seller, Account } = require('../../models');

const toggleVerifiedStatus = async(req, res) => {
    try {
        const seller = await Seller.findOne({ firebaseID: req.params.sellerId }).select('-__v -createdAt -updatedAt');
        const account = await Account.findOne({ firebaseID: req.params.sellerId });
        if (!seller) {
            return res.status(404).json({
                message: 'No Seller found with requested FirebaseID...'
            });
        }

        if (req.body.accountID) {
            if (!account) {
                await Account.create({
                    accountID: req.body.accountID,
                    firebaseID: req.params.sellerId
                });
            } else if (account.accountID != req.body.accountID) {
                account.accountID = req.body.accountID;
                await account.save();
            }
            seller.verifiedStatus = true;
            await seller.save();
            return res.status(200).json({
                message: 'Seller information updated successfully...',
                body: {
                    seller
                }
            });
        }

        return res.status(400).json({
            message: 'Bad request. Need to provide accountID linked with Razorpay...'
        });

    } catch (err) {
        return res.status(500).json({
            message: 'DB error...',
            debugInfo: err.message
        });
    }
}

module.exports = toggleVerifiedStatus;