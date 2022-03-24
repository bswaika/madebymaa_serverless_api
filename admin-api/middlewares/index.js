const authenticate = require('./authenticate');
const uploadImage = require('./image');
const injectCORSHeader = require('./inject');

module.exports = {
    authenticate,
    uploadImage,
    injectCORSHeader
};