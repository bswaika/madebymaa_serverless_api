const admin = require('../firebase');
const { User, Seller, Partner } = require('../models');

const authenticate = async(req, res, next) => {
    // DONT GIVE ACCESS TO ROUTE IF NO HEADER

    if (req.headers.authorization && req.params.entity) {
        try {
            // console.log("==================TOKEN: " + req.headers.authorization);
            const decodedToken = await admin.auth().verifyIdToken(req.headers.authorization);
            req.uid = decodedToken.uid;
            const { entity } = req.params;
            // console.log(req.uid);
            let resource;
            switch (entity) {
                case 'user':
                    resource = await User.findOne({ firebaseID: req.uid }).select('name phone email firebaseID location').lean();
                    break;
                case 'seller':
                    resource = await Seller.findOne({ firebaseID: req.uid, verifiedStatus: true }).select('kitchenName firebaseID location').lean(); // Need to add verifiedStatus : true in findOne() to block access 
                    break;
                case 'partner':
                    resource = await Partner.findOne({ firebaseID: req.uid, verifiedStatus: true }).select('name firebaseID phone').lean(); // Need to add verifiedStatus : true in findOne() to block access 
                    break;
                case 'admin':
                    const adminToken = 'some token';
                    if (req.uid == adminToken)
                        resource = {
                            name: 'Admin',
                            firebaseID: 'some token'
                        };
                    break;
                default:
                    return res.status(401).json({
                        message: 'Unauthorized Request. Bad entity...'
                    });
            }
            if (!resource) {
                if (entity == 'admin') {
                    // console.log('HELLO! CORS ADDED');
                    res.header('Access-Control-Allow-Origin', process.env.ADMIN_APP_DOMAIN);
                    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
                }
                return res.status(404).json({
                    message: 'No Verified Entity found with requested firebaseID...'
                })
            }
            resource.type = entity;
            req.entity = resource;
            console.log(req.entity);
            next();
        } catch (error) {
            console.log(error);
            if (req.params.entity == 'admin') {
                // console.log('HELLO! CORS ADDED');
                res.header('Access-Control-Allow-Origin', process.env.ADMIN_APP_DOMAIN);
                res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
            }
            return res.status(401).json({
                message: 'Unauthorized Request. Bad entity or token...',
                error: error.message
            });
        }
    } else {
        if (req.params.entity == 'admin') {
            // console.log('HELLO! CORS ADDED');
            res.header('Access-Control-Allow-Origin', process.env.ADMIN_APP_DOMAIN);
            res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
        }
        return res.status(401).json({
            message: 'Protected Route. Please login to access this route...'
        });
    }
}

module.exports = authenticate;