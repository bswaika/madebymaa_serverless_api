const { Banner } = require('../../models');

const create = async(req, res) => {
    try {
        // console.log(req.body);
        const banner = await Banner.create(req.body);
        if (!req.body.display)
            banner.display = false;
        await banner.save();
        return res.status(201).json({
            message: 'Banner created successfully...',
            body: {
                banner
            }
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Banner could not be created...',
            debugInfo: error.message
        });
    }
}

module.exports = create;