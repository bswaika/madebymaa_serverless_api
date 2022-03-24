const { Banner } = require('../models');

// const BANNERS = [
//     'https://unsplash.com/photos/vArvj5JJtzc/download?force=true&w=640',
//     'https://unsplash.com/photos/-YHSwy6uqvk/download?force=true&w=640',
//     'https://unsplash.com/photos/Vs7xQTZG-Bk/download?force=true&w=640',
//     'https://unsplash.com/photos/-YHSwy6uqvk/download?force=true&w=640',
//     'https://unsplash.com/photos/jpkfc5_d-DI/download?force=true&w=640',
//     'https://unsplash.com/photos/XoByiBymX20/download?force=true&w=640',
//     'https://unsplash.com/photos/sOomKkiqmTY/download?force=true&w=640',
//     'https://unsplash.com/photos/R3LcfTvcGWY/download?force=true&w=640',
//     'https://unsplash.com/photos/LR559Dcst70/download?force=true&w=640',
//     'https://unsplash.com/photos/6G98hiCJETA/download?force=true&w=640'
// ];

const getBanners = async(req, res) => {
    try {
        const banners = await Banner.find({ display: true }).select('name link imageURL');
        res.status(200).json({
            message: 'Banners fetched successfully...',
            banners
        });
    } catch (err) {
        return res.status(500).json({
            message: 'DB error...',
            debugInfo: err.message
        });
    }

}

module.exports = { getBanners };