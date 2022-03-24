const toggleVerifiedStatus = require('./toggleVerifiedStatus');
const {get, getAll } = require('./get');

const status = async(req, res) => {
    return res.status(200).json({
        status: 'Partner API is running...'
    });
}

module.exports = {
    toggleVerifiedStatus,
    get,
    getAll
};