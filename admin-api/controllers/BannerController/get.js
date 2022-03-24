const { Banner } = require('../../models');

const getAll = async(req, res) => {
    try {
        const banners = await Banner.find({});

        if (!banners) {
            return res.status(404).json({
                message: 'No Banners found...'
            });
        }

        return res.status(200).json({
            message: 'Banner information fetched successfully...',
            body: {
                banners,
                count: banners.length
            }
        });
    } catch (err) {
        return res.status(500).json({
            message: 'DB error...',
            debugInfo: err.message
        });
    }
}

module.exports = getAll;