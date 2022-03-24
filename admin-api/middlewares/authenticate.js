const admin = require('../firebase');

const authenticate = async(req, res, next) => {
    if (req.headers.authorization) {
        try {
            console.log("==================TOKEN: " + req.headers.authorization);
            const adminToken = 'Some Token';
            const decodedToken = await admin.auth().verifyIdToken(req.headers.authorization);
            console.log(decodedToken.uid);
            if (decodedToken.uid == adminToken) {
                next();
            } else {
                throw new Error('Bad Credentials...');
            }
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