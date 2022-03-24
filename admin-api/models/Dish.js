const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
    sunday: {
        type: Boolean,
        default: false
    },
    monday: {
        type: Boolean,
        default: false
    },
    tuesday: {
        type: Boolean,
        default: false
    },
    wednesday: {
        type: Boolean,
        default: false
    },
    thursday: {
        type: Boolean,
        default: false
    },
    friday: {
        type: Boolean,
        default: false
    },
    saturday: {
        type: Boolean,
        default: false
    }
});

const dishSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Dish should have a name!']
    },
    sellerID: {
        type: String,
        required: [true, 'Dish should have a seller!']
    },
    type: String,
    price: {
        type: Number,
        required: [true, 'Dish should have a price!']
    },
    schedule: {
        type: scheduleSchema,
        required: [true, 'Dish should have a schedule!']
    },
    description: {
        type: String,
        required: [true, 'Dish should have a description!']
    },
    imageURL: {
        type: String,
        default: 'placeholder.jpg'
    },
    availability: {
        type: Boolean,
        default: true
    },
    rating: Number,
    category: String,
    discount: Number
}, {
    timestamps: true
});

const Dish = mongoose.model('Dish', dishSchema);

module.exports = Dish;