'use strict';

const api = require('lambda-api')({ version: '1.0.0', base: 'api/v1/partners' });
const db = require('./db');

const Middleware = require('./middlewares');
const { PartnerController } = require('./controllers');

api.get('/', Middleware.authenticate, PartnerController.get)
api.patch('/', Middleware.logUtility, Middleware.authenticate, Middleware.uploadImage, PartnerController.update);
api.delete('/', Middleware.authenticate, PartnerController.remove);

api.get('/status', PartnerController.status);
api.post('/login', Middleware.authenticate, PartnerController.login);
api.post('/register', Middleware.logUtility, Middleware.uploadImage, PartnerController.register);
api.patch('/toggle', Middleware.authenticate, PartnerController.togglePartnerStatus);

module.exports.router = async(event, context) => {
    console.log("Starting LAMBDA execution...");
    return await api.run(event, context);
};