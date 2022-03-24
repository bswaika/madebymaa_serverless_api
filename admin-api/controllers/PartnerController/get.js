const { Partner } = require('../../models');

const get = async(req, res) => {
    try {
        const partner = await Partner.findOne({ firebaseID: req.params.partnerId }).select('-__v -createdAt -updatedAt');

        if (!partner) {
            return res.status(404).json({
                message: 'No Partner found with requested FirebaseID...'
            });
        }

        return res.status(200).json({
            message: 'Partner information fetched successfully...',
            body: {
                partner
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
        const partners = await Partner.find({}).sort('-createdAt').select('-__v -createdAt -updatedAt');

        if (!partners.length) {
            return res.status(404).json({
                message: 'No Partner found ...'
            });
        }

        return res.status(200).json({
            message: 'Partner information fetched successfully...',
            body: {
                partners,
                count: partners.length
            }
        });
    } catch (err) {
        return res.status(500).json({
            message: 'DB error...',
            debugInfo: err.message
        });
    }
}

module.exports = {get, getAll };