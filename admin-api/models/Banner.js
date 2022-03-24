const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    name: String,
    display: {
        type: Boolean,
        default: false,
    },
    imageURL: {
        type: String,
        default: 'placeholder.jpg'
    },
    link: String
});

const Banner = mongoose.model('Banner', bannerSchema);

module.exports = Banner;