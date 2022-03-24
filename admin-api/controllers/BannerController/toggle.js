const { Banner } = require('../../models');

const toggle = async(req, res) => {
    try {
        const banner = await Banner.findById(req.params.bannerId);
        if (!banner) {
            return res.status(404).json({
                message: 'No Banner found...'
            });
        }
        banner.display = !banner.display;
        await banner.save();
        return res.status(200).json({
            message: 'Banner Display toggled successfully...',
            body: {
                banner
            }
        });
    } catch (error) {
        return res.status(500).json({
            message: 'DB Error...',
            debugInfo: error.message
        });
    }
}

module.exports = toggle;