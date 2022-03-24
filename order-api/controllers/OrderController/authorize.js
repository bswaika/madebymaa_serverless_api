const { Order, User, Seller, Partner } = require('../../models');
const STATUS = require('../../statuscodes');

const allowUsers = async(req, res, next) => {
    if (req.entity.type != 'user') {
        return res.status(401).json({
            message: 'Unauthorized Request. Bad entity...'
        });
    }
    next();
}

const allowSellers = async(req, res, next) => {
    if (req.entity.type != 'seller') {
        return res.status(401).json({
            message: 'Unauthorized Request. Bad entity...'
        });
    }
    next();
}

const allowPartners = async(req, res, next) => {
    if (req.entity.type != 'partner') {
        return res.status(401).json({
            message: 'Unauthorized Request. Bad entity...'
        });
    }
    next();
}

const fetchOrders = async(req, res, next) => {
    if (req.query.status) {
        try {
            const page = req.query.page * 1 || 1;
            const limit = req.query.limit * 1 || 10;
            const skip = (page - 1) * limit;
            let orders, status;
            switch (req.entity.type) {
                case 'user':
                    status = req.query.status == 'ONGOING' ? { $in: [STATUS.AWAITING_CONFIRMATION, STATUS.AWAITING_DELIVERY_PARTNER, STATUS.ORDER_PICKED_UP, STATUS.RESTAUTANT_CONFIRMED, STATUS.PARTNER_CONFIRMED] } : req.query.status;
                    orders = await Order.find({ userID: req.entity.firebaseID, status }).skip(skip).limit(limit).sort('-createdAt').lean();
                    if (!orders.length) {
                        throw new Error('OrderNotFoundError');
                    }
                    orders = await Promise.all(orders.map(async(order) => {
                        const { kitchenName } = await Seller.findOne({ firebaseID: order.sellerID }).select('kitchenName').lean();
                        if (order.partnerID) {
                            const partner = await Partner.findOne({ firebaseID: order.partnerID }).select('name phone').lean();
                            order.partner = partner;
                        }
                        order.kitchenName = kitchenName;
                        return order;
                    }));
                    break;
                case 'seller':
                    status = req.query.status == 'ONGOING' ? { $in: [STATUS.AWAITING_DELIVERY_PARTNER, STATUS.ORDER_PICKED_UP, STATUS.RESTAUTANT_CONFIRMED, STATUS.PARTNER_CONFIRMED] } : req.query.status;
                    orders = await Order.find({ sellerID: req.entity.firebaseID, status }).skip(skip).limit(limit).sort('-createdAt').lean();
                    if (!orders.length) {
                        throw new Error('OrderNotFoundError');
                    }
                    orders = await Promise.all(orders.map(async(order) => {
                        const { name } = await User.findOne({ firebaseID: order.userID }).select('name').lean();
                        if (order.partnerID) {
                            const partner = await Partner.findOne({ firebaseID: order.partnerID }).select('name phone').lean();
                            order.partner = partner;
                        }
                        order.name = name;
                        return order;
                    }));
                    break;
                case 'partner':
                    status = req.query.status == 'ONGOING' ? { $in: [STATUS.ORDER_PICKED_UP, STATUS.PARTNER_CONFIRMED] } : req.query.status;
                    if (status == STATUS.AWAITING_DELIVERY_PARTNER) {
                        orders = await Order.find({ status }).skip(skip).limit(limit).sort('-createdAt').lean();
                    } else {
                        orders = await Order.find({ partnerID: req.entity.firebaseID, status }).skip(skip).limit(limit).sort('-createdAt').lean();
                    }

                    if (!orders.length) {
                        throw new Error('OrderNotFoundError');
                    }
                    orders = await Promise.all(orders.map(async(order) => {
                        const { name, address } = await User.findOne({ firebaseID: order.userID }).select('name address').lean();
                        const { kitchenName, address: kitchenAddress } = await Seller.findOne({ firebaseID: order.sellerID }).select('kitchenName address').lean();
                        order.name = name;
                        order.kitchenName = kitchenName;
                        order.address = address;
                        order.kitchenAddress = kitchenAddress;
                        delete order.bill.total;
                        delete order.bill.net;
                        delete order.bill.deliveryCharge;
                        delete order.bill.tax;
                        return order;
                    }));
                    break;
                case 'admin':
                    status = req.query.status;
                    orders = await Order.find({ status }).skip(skip).limit(limit).sort('-createdAt').lean();
                    if (!orders.length) {
                        throw new Error('OrderNotFoundError');
                    }
                    orders = await Promise.all(orders.map(async(order) => {
                        const { name, phone, address } = await User.findOne({ firebaseID: order.userID }).select('name phone address').lean();
                        const { kitchenName, phone: kitchenPhone, address: kitchenAddress } = await Seller.findOne({ firebaseID: order.sellerID }).select('kitchenName phone address').lean();
                        order.name = name;
                        order.kitchenName = kitchenName;
                        order.address = address;
                        order.kitchenAddress = kitchenAddress;
                        order.phone = phone;
                        order.kitchenPhone = kitchenPhone;
                        if (order.partnerID) {
                            const partner = await Partner.findOne({ firebaseID: order.partnerID }).select('name phone').lean();
                            order.partner = partner;
                        }
                        return order;
                    }));
                    break;
            }
            req.orders = orders;
            next();
        } catch (err) {
            if (req.entity.type == 'admin') {
                // console.log('HELLO! CORS ADDED');
                res.header('Access-Control-Allow-Origin', process.env.ADMIN_APP_DOMAIN);
                res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
            }
            if (err.message == 'OrderNotFoundError') {
                return res.status(404).json({
                    message: 'No Orders found...'
                });
            }
            return res.status(500).json({
                message: 'DB Error...',
                error: err.message
            });
        }
    } else {
        return res.status(400).json({
            message: 'Bad Request. Expected query param status...'
        });
    }

}

const fetchOrder = async(req, res, next) => {
    if (req.params.orderId) {
        try {
            const order = await Order.findById(req.params.orderId).lean();
            let partner;
            if (!order) {
                return res.status(404).json({
                    message: 'No Order found with requested orderID...'
                });
            }
            const { name, phone, address } = await User.findOne({ firebaseID: order.userID }).select('name phone address').lean();
            const { kitchenName, phone: kitchenPhone, address: kitchenAddress } = await Seller.findOne({ firebaseID: order.sellerID }).select('kitchenName phone address').lean();
            if (order.partnerID) {
                partner = await Partner.findOne({ firebaseID: order.partnerID }).select('name phone').lean();
            }

            switch (req.entity.type) {
                case 'user':
                    if (order.userID != req.entity.firebaseID) {
                        return res.status(400).json({
                            message: 'Bad Request. You can only access your orders...'
                        });
                    }
                    if (partner) {
                        order.partner = partner;
                    }
                    order.kitchenName = kitchenName;
                    break;
                case 'seller':
                    if (order.sellerID != req.entity.firebaseID) {
                        return res.status(400).json({
                            message: 'Bad Request. You can only access your orders...'
                        });
                    }
                    if (partner) {
                        order.partner = partner;
                    }
                    order.name = name;
                    break;
                case 'partner':
                    if (!order.partnerID || order.partnerID != req.entity.firebaseID) {
                        return res.status(400).json({
                            message: 'Bad Request. You must accept an order to view details...'
                        })
                    }
                    order.name = name;
                    order.kitchenName = kitchenName;
                    order.phone = phone;
                    order.kitchenPhone = kitchenPhone;
                    order.address = address;
                    order.kitchenAddress = kitchenAddress;
                    delete order.bill.total;
                    delete order.bill.net;
                    delete order.bill.deliveryCharge;
                    delete order.bill.tax;
                    break;
                case 'admin':
                    order.name = name;
                    order.kitchenName = kitchenName;
                    order.phone = phone;
                    order.kitchenPhone = kitchenPhone;
                    order.address = address;
                    order.kitchenAddress = kitchenAddress;
                    if (partner) {
                        order.partner = partner;
                    }
                    break;

            }
            req.order = order;
            next();
        } catch (err) {
            return res.status(500).json({
                message: 'DB Error...',
                error: err.message
            });
        }
    } else {
        return res.status(400).json({
            message: 'Bad Request. Expected route param orderId...'
        });
    }
}

module.exports = {
    allowUsers,
    allowSellers,
    allowPartners,
    fetchOrders,
    fetchOrder
}