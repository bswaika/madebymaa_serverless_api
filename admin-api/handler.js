'use strict';

const api = require('lambda-api')({ version: '1.0.0', base: 'api/v1/admin' });
const db = require('./db');

const Middleware = require('./middlewares');
const {
    UserController,
    DishController,
    SellerController,
    PartnerController,
    SplitController,
    StatController,
    BannerController,
    EnvController,
    DeliveryController,
    handleCheckToken
} = require('./controllers');

api.register((api, opts) => {
    api.get('/', Middleware.authenticate, Middleware.injectCORSHeader, BannerController.getAll);
    api.post('/', Middleware.authenticate, Middleware.injectCORSHeader, Middleware.uploadImage, BannerController.create);
    api.patch('/:bannerId', Middleware.authenticate, Middleware.injectCORSHeader, BannerController.toggle);
}, { prefix: 'banners' });

api.use(Middleware.authenticate);
api.use(Middleware.injectCORSHeader);

api.get('/token', handleCheckToken);

api.register((api, opts) => {
    api.get('/', EnvController.getAll);
    api.patch('/', EnvController.update);
}, { prefix: 'keys' });

api.get('/users', UserController.getAll);
api.get('/users/:userId', UserController.get);

api.register((api, opts) => {
    api.get('/', SellerController.getAll);
    api.get('/:sellerId', SellerController.get);
    api.patch('/:sellerId', SellerController.toggleVerifiedStatus);
    api.patch('/:sellerId/unverify', SellerController.unverify);

    api.get('/:sellerId/dishes', DishController.getAll);
    api.get('/:sellerId/dishes/:dishId', DishController.get);
}, { prefix: 'sellers' });

api.register((api, opts) => {
    api.get('/', PartnerController.getAll);
    api.get('/:partnerId', PartnerController.get);
    api.patch('/:partnerId', PartnerController.toggleVerifiedStatus);

    api.get('/:partnerId/deliveries', DeliveryController.getAll);
    api.get('/:partnerId/deliveries/:orderId', DeliveryController.get);
}, { prefix: 'partners' });

api.register((api, opts) => {
    api.get('/', SplitController.getAll);
}, { prefix: 'settlements' });

api.get('/stats', StatController.orders);


module.exports.router = async(event, context) => {
    console.log("Starting LAMBDA execution...");
    return await api.run(event, context);
};