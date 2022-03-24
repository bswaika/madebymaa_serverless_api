const toggleVerifiedStatus = require('./toggleVerifiedStatus');
const {get, getAll } = require('./get');
const unverify = require('./unverify');

const status = async(req, res) => {
    return res.status(200).json({
        status: 'Seller API is running...'
    });
}

module.exports = {
    toggleVerifiedStatus,
    get,
    getAll,
    unverify
};