'use strict';

const api = require('lambda-api')({ version: '1.0.0', base: 'api/v1/sellers' });
const db = require('./db');

const Middleware = require('./middlewares');
const { SellerController, DishController } = require('./controllers');

api.get('/', Middleware.authenticate, SellerController.get)
api.patch('/', Middleware.logUtility, Middleware.authenticate, Middleware.uploadImage, SellerController.update);
api.delete('/', Middleware.authenticate, SellerController.remove);

api.get('/status', SellerController.status);
api.post('/login', Middleware.authenticate, SellerController.login);
api.post('/register', Middleware.logUtility, Middleware.uploadImage, SellerController.register);
api.patch('/toggle', Middleware.authenticate, SellerController.toggleKitchenStatus);

api.get('/dishes', Middleware.authenticate, DishController.getAll);
api.get('/dishes/:id', Middleware.authenticate, DishController.get);
api.post('/dishes', Middleware.authenticate, Middleware.uploadImage, DishController.create);
api.patch('/dishes/:id', Middleware.authenticate, Middleware.uploadImage, DishController.update);
api.delete('/dishes/:id', Middleware.authenticate, DishController.remove);
api.get('/dishes/today', Middleware.authenticate, DishController.today);

// /home/dishesToday ==> /dishes/today GET fetches all dishes that are being served today
// /tutorial GET fetches s3 link for tutorial video on S3

module.exports.router = async(event, context) => {
    console.log("Starting LAMBDA execution...");
    return await api.run(event, context);
};