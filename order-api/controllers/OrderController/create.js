const { Order, Seller, Dish } = require('../../models');
const { RZP } = require('../../providers');
const { orderCreateSchema } = require('../../validators');
const STATUS = require('../../statuscodes');

const isValidOrder = async({ kitchenStatus, items }) => {
    try {
        const errors = [];
        if (!kitchenStatus) {
            errors.push(`The kitchen is currently offline!`);
        }
        const week = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const today = week[new Date().getDay()];
        let results = await Promise.all(items.map(async(item) => {
            const { name, availability, schedule } = await Dish.findById(item.dishID);
            return (!availability || !schedule[today]) ? {
                name,
                status: false
            } : {
                name,
                status: true
            }
        }));
        results = results.filter((result) => !result.status);
        results.forEach((result) => { errors.push(`The dish ${result.name} is currently unavailable!`); })
        return errors;
    } catch (err) {
        throw err;
    }
}

const create = async(req, res) => {
    const session = await Order.startSession();;
    try {
        const { error, value } = orderCreateSchema.validate(req.body);
        if (error) {
            throw error;
        }

        session.startTransaction();

        const { kitchenStatus, location } = await Seller.findOne({ firebaseID: value.sellerID }).session(session);
        const errors = await isValidOrder({ kitchenStatus, items: value.bill.items });
        if (errors.length > 0) {
            await session.abortTransaction();
            session.endSession();
            return res.status(406).json({
                message: 'Order cannot be accepted. Please try again later...',
                errors
            });
        }

        value.userID = req.entity.firebaseID;
        value.from = location;
        value.to = req.entity.location;
        value.status = STATUS.ORDER_CREATED;

        const [order] = await Order.create([value], { session });

        console.log(order);
        console.log(JSON.stringify(order._id));

        const { id } = await RZP.createOrder({
            amount: order.bill.net * 100,
            currency: 'INR',
            receipt: JSON.stringify(order._id)
        });

        order.orderID = id;
        await order.save();

        await session.commitTransaction();
        session.endSession();

        const response = {
            order,
            options: {
                order_id: order.orderID,
                amount: order.bill.net * 100,
                currency: 'INR',
                name: 'Made By Maa',
                description: 'Made in India',
                prefill: {
                    name: req.entity.name,
                    contact: req.entity.phone.startsWith('+') ? req.entity.phone : `+91${req.entity.phone}`,
                    email: req.entity.email
                },
                theme: {
                    color: '#5E1EAA'
                },
                modal: {
                    confirm_close: true
                },
                send_sms_hash: true
            }
        }
        return res.status(200).json({
            message: 'Order created successfully...',
            body: response
        });

    } catch (err) {
        console.log("=============ERROR: ", err);
        if (err.isJoi) {
            session.endSession();
            return res.status(400).json({
                message: 'Bad Request. Validation Error...',
                debugInfo: err
            });
        }
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({
            message: 'Internal Server Error...',
            debugInfo: err.message
        });
    }
}

module.exports = create;