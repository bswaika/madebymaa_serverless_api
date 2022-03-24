const SellerController = require('./SellerController');
const DishController = require('./DishController');
const UserController = require('./UserController');
const PartnerController = require('./PartnerController');
const SplitController = require('./SplitController');
const StatController = require('./StatController');
const BannerController = require('./BannerController');
const EnvController = require('./EnvController');
const DeliveryController = require('./DeliveryController');

const handleCheckToken = async(req, res) => {
    return res.status(200).json({
        message: 'Token Check Passed...',
    });
}

module.exports = {
    SellerController,
    DishController,
    UserController,
    PartnerController,
    SplitController,
    StatController,
    BannerController,
    EnvController,
    DeliveryController,
    handleCheckToken
}