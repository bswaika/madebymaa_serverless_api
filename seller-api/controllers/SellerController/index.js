const login = require('./login');
const register = require('./register');
const update = require('./update');
const get = require('./get');
const remove = require('./remove');
const toggleKitchenStatus = require('./toggle');

const status = async(req, res) => {
    return res.status(200).json({
        status: 'Seller API is running...'
    });
}

module.exports = {
    status,
    login,
    register,
    update,
    get,
    remove,
    toggleKitchenStatus
};