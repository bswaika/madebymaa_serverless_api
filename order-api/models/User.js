const mongoose = require('mongoose');

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

const cartSchema = new mongoose.Schema({
    items: [{
        dishID: String,
        quantity: Number,
        sellerID: String,
        name: String,
        price: Number
    }],
    active: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'User should have a name!']
    },
    firebaseID: {
        type: String,
        unique: [true, 'User should be unique on Firebase!'],
        required: [true, 'User should be logged in by Firebase!']
    },
    cart: cartSchema,
    phone: String,
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Others']
    },
    email: {
        type: String,
        unique: [true, 'User should have a unique email!'],
        required: [true, 'User should have a email!']
    },
    dob: Date,
    address: {
        type: String,
        required: [true, 'User should have a address!']
    },
    pin: {
        type: Number,
        required: [true, 'User should have a pin!']
    },
    location: {
        type: pointSchema,
        index: '2dsphere',
        required: [true, 'User should have a location in proper GeoJSON!']
    },
    state: String,
    avatar: String,
    rating: Number
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

module.exports = User;