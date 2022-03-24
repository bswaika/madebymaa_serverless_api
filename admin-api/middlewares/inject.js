const injectCORSHeader = async(req, res, next) => {
    res.header('Access-Control-Allow-Origin', process.env.ADMIN_APP_DOMAIN);
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    next();
}

module.exports = injectCORSHeader;