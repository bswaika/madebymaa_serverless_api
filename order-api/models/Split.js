const mongoose = require('mongoose');

const splitSchema = new mongoose.Schema({
    orderID: {
        type: String,
        required: [true, 'Split must have a valid orderID'],
    },
    paymentID: {
        type: String,
        required: [true, 'Split must have a valid paymentID'],
    },
    sellerID: {
        type: String,
        required: [true, 'Split must have a valid firebaseID']
    },
    amount: {
        type: Number,
        required: [true, '']
    },
    status: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const Split = mongoose.model('Split', splitSchema);

module.exports = Split;