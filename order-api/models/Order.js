const mongoose = require('mongoose');
const STATUS = require('../statuscodes');

const pointSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Point'],
        required: true
    },
    coordinates: {
        type: [Number], //[long, lat]
        required: true
    }
});

const itemSchema = new mongoose.Schema({
    dishID: String,
    name: String,
    quantity: Number,
    price: Number,
    amount: Number
})

const billSchema = new mongoose.Schema({
    items: [itemSchema],
    total: Number,
    deliveryCharge: Number,
    tax: {
        sgst: Number,
        cgst: Number
    },
    net: Number
});

const orderSchema = new mongoose.Schema({
    userID: {
        type: String,
        required: [true, 'Order should have a userID!']
    },
    sellerID: {
        type: String,
        required: [true, 'Order should have a sellerID!']
    },
    orderID: String,
    paymentID: String,
    partnerID: String,
    status: {
        type: String,
        enum: STATUS.enum
    },
    bill: billSchema,
    to: {
        type: pointSchema,
        index: '2dsphere',
        required: [true, 'Order should have a to location in proper GeoJSON!']
    },
    from: {
        type: pointSchema,
        index: '2dsphere',
        required: [true, 'Order should have a from location in proper GeoJSON!']
    },
    rating: Number
}, {
    timestamps: true
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;