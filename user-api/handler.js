'use strict';

const api = require('lambda-api')({ version: '1.0.0', base: 'api/v1/users' });
const db = require('./db');

const Middleware = require('./middlewares');
const { UserController, CartController, SearchController, BannerController } = require('./controllers');

api.get('/', Middleware.authenticate, UserController.get);
api.patch('/', Middleware.logUtility, Middleware.authenticate, Middleware.uploadImage, UserController.update);
api.delete('/', Middleware.authenticate, UserController.remove);

api.get('/status', UserController.status);
api.post('/login', Middleware.authenticate, UserController.login);
api.post('/register', Middleware.logUtility, Middleware.uploadImage, UserController.register);

api.get('/banners', BannerController.getBanners);

api.get('/cart', Middleware.authenticate, Middleware.getUserLocation, SearchController.getKitchensByLocation, CartController.get);
api.patch('/cart/:dishId', Middleware.authenticate, CartController.add);
api.delete('/cart', Middleware.authenticate, CartController.removeAll);
api.delete('/cart/:dishId', Middleware.authenticate, CartController.removeOne);

api.get(
    '/search',
    Middleware.authenticate,
    Middleware.getUserLocation,
    SearchController.getKitchensByLocation,
    SearchController.populateDishes,
    SearchController.depopulateKitchensWithoutDishes,
    SearchController.handleSearchQuery,
    SearchController.handleResponse
);

api.get(
    '/near',
    Middleware.authenticate,
    Middleware.getUserLocation,
    SearchController.getKitchensByLocation,
    SearchController.handleResponse
);

api.get(
    '/new',
    Middleware.authenticate,
    Middleware.getUserLocation,
    SearchController.getKitchensByLocation,
    SearchController.getNew,
    SearchController.handleResponse
);

api.get('/menu/:id', SearchController.getMenu);



module.exports.router = async(event, context) => {
    console.log("Starting LAMBDA execution...");
    return await api.run(event, context);
};