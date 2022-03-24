const { Dish, Seller, Env } = require('../models');

// const DELIVERY_RADIUS = 50; //in Kms

// const getUserLocation = async(req, res, next) => {
//     // Fetch user's registered location from DB
//     req.location = {
//         type: 'Point',
//         coordinates: [88.457595, 22.587446]
//     };
//     // set req.location = user's registered location from DB
//     // if no user found return error for not registered user
//     //if no location found return error to register address
//     next();
// }

const getKitchensByLocation = async(req, res, next) => {
    try {
        const DELIVERY_RADIUS = await Env.findOne({ key: "DELIVERY_RADIUS" });
        if (!DELIVERY_RADIUS) {
            return res.status(500).json({
                message: 'Internal Server Error...'
            });
        }
        const page = req.query.page * 1 || 1;
        const limit = req.query.limit * 1 || 10;
        const skip = (page - 1) * limit;
        const serviceableKitchens = await Seller.where('location').within({ center: req.location.coordinates, radius: DELIVERY_RADIUS.value / 6378, spherical: true }).select('-_id firebaseID kitchenName avatar bio rating kitchenStatus verifiedStatus createdAt').skip(skip).limit(limit).lean();
        if (!serviceableKitchens.length) {
            return res.status(404).json({
                message: 'Could not find a Seller near you...'
            });
        }
        req.kitchens = serviceableKitchens.filter((kitchen) => kitchen.verifiedStatus); //.filter((kitchen) => kitchen.verifiedStatus); after admin is completed
        next();
    } catch (err) {
        return res.status(500).json({
            message: 'DB error...',
            debugInfo: err.message
        });
    }
}

const populateDishes = async(req, res, next) => {
    try {
        const queryObj = {...req.query };
        const excludedFields = ['page', 'sort', 'limit', 'searchQuery'];
        excludedFields.forEach(el => delete queryObj[el]);

        // console.log(queryObj);
        // let queryStr = JSON.stringify(queryObj);
        // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

        const dishPromises = req.kitchens.map(async(kitchen) => {
            if (req.query.sort) {
                const sortBy = req.query.sort.split(',').join(' ');
                return await Dish.find({ sellerID: kitchen.firebaseID }).find(queryObj).sort(sortBy).select('-__v -createdAt -updatedAt');
            }
            return await Dish.find({ sellerID: kitchen.firebaseID }).find(queryObj).sort('-createdAt').select('-__v -createdAt -updatedAt');
        })
        const dishes = await Promise.all(dishPromises);

        req.kitchens = req.kitchens.map((kitchen) => {
            kitchen.dishes = dishes.filter((dishArray) => {
                if (dishArray.length > 0)
                    return dishArray[0].sellerID == kitchen.firebaseID
            })[0];
            if (!kitchen.dishes) {
                kitchen.dishes = [];
            }
            return kitchen;
        });

        const week = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const today = week[new Date().getDay()];
        req.kitchens = req.kitchens.map((kitchen) => {
            kitchen.dishes = kitchen.dishes.filter((dish) => dish.schedule[today]);
            kitchen.dishCount = kitchen.dishes.length;
            return kitchen;
        });

        next();
    } catch (err) {
        return res.status(500).json({
            message: 'DB error...',
            debugInfo: err.message
        });
    }
}

const depopulateKitchensWithoutDishes = async(req, res, next) => {
    req.kitchens = req.kitchens.filter((kitchen) => kitchen.dishes.length > 0);
    next();
}

const handleSearchQuery = async(req, res, next) => {
    if (req.query.searchQuery) {
        const query = req.query.searchQuery
        req.kitchens = req.kitchens.filter((kitchen) => {
            const kitchenNameCheck = kitchen.kitchenName.toLowerCase().search(query.toLowerCase()) == -1 ? false : true;
            if (!kitchenNameCheck) {
                kitchen.dishes = kitchen.dishes.filter((dish) => dish.name.toLowerCase().search(query.toLowerCase()) == -1 ? false : true)
                kitchen.dishCount = kitchen.dishes.length
            }

            if (!kitchenNameCheck && kitchen.dishes.length == 0) {
                return false;
            }
            return true;
        })
    }
    next();
}

const getMenu = async(req, res) => {
    const kitchenId = req.params.id;
    try {
        const seller = await Seller.findOne({ firebaseID: kitchenId, verifiedStatus: true }).select('-_id kitchenName certificate firebaseID avatar rating bio kitchenStatus').lean(); // Add verified status check after admin is completed {firebaseID: kitchenId, verifiedStatus: true}
        if (!seller) {
            return res.status(404).json({
                message: 'Could not find requested Seller...'
            });
        }
        const dishes = await Dish.find({ sellerID: kitchenId }).select('-__v -createdAt -updatedAt');

        // MIGHT HGAVE TO QUERY OFFERS AND OTHER STUFF LATER

        const week = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const today = week[new Date().getDay()];

        if (!dishes) {
            return res.status(404).json({
                message: 'Requested Seller does not have any dishes...'
            });
        }
        seller.dishes = dishes.filter((dish) => dish.schedule[today]);
        return res.status(200).json({
            message: 'Kitchen menu fetched successfully...',
            menu: seller
        });
    } catch (err) {
        return res.status(500).json({
            message: 'DB error...',
            debugInfo: err.message
        });
    }
}

const getNew = async(req, res, next) => {
    const today = new Date();
    req.kitchens = req.kitchens.filter((kitchen) => {
        const openedOn = new Date(kitchen.createdAt);
        const timeDiff = Math.abs(today - openedOn);
        const monthDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24 * 30));
        return monthDiff == 1;
    })
    next();
}

const handleResponse = async(req, res) => {
    if (!req.kitchens.length) {
        return res.status(404).json({
            message: 'No results were found...'
        });
    }
    return res.status(200).json({
        message: 'Search successful...',
        kitchens: req.kitchens,
        kitchenCount: req.kitchens.length
    });
}

module.exports = {
    getKitchensByLocation,
    populateDishes,
    depopulateKitchensWithoutDishes,
    handleSearchQuery,
    handleResponse,
    getMenu,
    getNew
}