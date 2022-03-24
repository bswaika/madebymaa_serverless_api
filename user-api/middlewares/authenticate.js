const admin = require('../firebase');

const authenticate = async(req, res, next) => {
    // DONT GIVE ACCESS TO ROUTE IF NO HEADER

    if (req.headers.authorization) {
        try {
            // console.log("==================TOKEN: " + req.headers.authorization);
            const decodedToken = await admin.auth().verifyIdToken(req.headers.authorization);
            req.uid = decodedToken.uid;
            next();
        } catch (error) {
            return res.status(401).json({
                message: 'Unauthorized Request. Bad token...',
                error: error.message
            });
        }
    } else {
        return res.status(401).json({
            message: 'Protected Route. Please login to access this route...'
        });
    }
}

module.exports = authenticate;