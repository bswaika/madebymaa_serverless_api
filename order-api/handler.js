'use strict';

const api = require('lambda-api')({ version: '1.0.0', base: 'api/v1/orders' });
const db = require('./db');

const Middleware = require('./middlewares');
const { OrderController, FCMController, StatController } = require('./controllers');
const Schedulers = require('./schedulers');

api.register((api, opts) => {

    //api.use(Middleware.authenticate);

    api.get('/', Middleware.authenticate, OrderController.authorize.fetchOrders, OrderController.handleGet);
    api.get('/:orderId', Middleware.authenticate, OrderController.authorize.fetchOrder, OrderController.handleGet);

    api.post('/', Middleware.authenticate, OrderController.authorize.allowUsers, OrderController.create);
    api.patch('/:orderId/validate', Middleware.authenticate, OrderController.authorize.allowUsers, OrderController.validate);
    api.patch('/:orderId/accept', Middleware.authenticate, OrderController.authorize.allowSellers, OrderController.accept);
    api.patch('/:orderId/prepare', Middleware.authenticate, OrderController.authorize.allowSellers, OrderController.prepare);
    api.patch('/:orderId/assign', Middleware.authenticate, OrderController.authorize.allowPartners, OrderController.assign);
    api.patch('/:orderId/pickup', Middleware.authenticate, OrderController.authorize.allowPartners, OrderController.pickup);
    api.patch('/:orderId/deliver', Middleware.authenticate, OrderController.authorize.allowPartners, OrderController.deliver);
    api.patch('/:orderId/rate', Middleware.authenticate, OrderController.authorize.allowUsers, OrderController.rate);

    api.post('/notify/:token', Middleware.authenticate, FCMController.notify); //Retry Route for FCM notify
    api.post('/broadcast', Middleware.authenticate, FCMController.broadcast); // Retry Route for FCM broadcast
    api.patch('/token', Middleware.authenticate, FCMController.refreshFCMToken); //Patch Route for FCM Token

    // Stats Routes for sellers
    api.get('/stats', Middleware.authenticate, OrderController.authorize.allowSellers, StatController.seller.yesterdayStats, StatController.seller.todayStats);
    api.get('/stats/today', Middleware.authenticate, OrderController.authorize.allowSellers, StatController.seller.todayStats);

}, { prefix: '/:entity' });

//TEST ROUTES --> need to remove

api.post('/notify/:token', FCMController.notify);
api.post('/broadcast', FCMController.broadcast);

//api.routes(true);

module.exports.router = async(event, context) => {
    console.log("Starting LAMBDA execution...");
    console.log(JSON.stringify(event, null, 2));
    return await api.run(event, context);
};

// module.exports.testjob = async(event, context) => {
//     console.log(`=========Time: ${Date.now()}`);
//     return 'Finished';
// }

module.exports.COINPBUScheduler = Schedulers.cancelOrdersIfNotPaidByUser;
module.exports.COINABKScheduler = Schedulers.cancelOrdersIfNotAcceptedByKitchen;
module.exports.SORIDScheduler = Schedulers.splitOrderRevenueIfDelivered;