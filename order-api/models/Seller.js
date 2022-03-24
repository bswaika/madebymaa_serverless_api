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


const sellerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Seller should have a name!']
    },
    firebaseID: {
        type: String,
        unique: [true, 'Seller should be unique on Firebase!'],
        required: [true, 'Seller should be logged in by Firebase!']
    },
    bio: String,
    kitchenName: String,
    kitchenStatus: {
        type: Boolean,
        default: false
    },
    verifiedStatus: {
        type: Boolean,
        deafult: false
    },
    phone: String,
    email: {
        type: String,
        unique: [true, 'Seller should have a unique email!'],
        required: [true, 'Seller should have a email!']
    },
    dob: Date,
    address: {
        type: String,
        required: [true, 'Seller should have a address!']
    },
    pin: {
        type: Number,
        required: [true, 'Seller should have a pin!']
    },
    location: {
        type: pointSchema,
        index: '2dsphere',
        required: [true, 'Seller should have a location in proper GeoJSON!']
    },
    state: String,
    pan: String,
    aadhar: String,
    certificate: String,
    bankAccount: String,
    ifsc: String,
    upi: String,
    avatar: {
        type: String,
        default: 'placeholder.jpg'
    },
    rating: Number
}, {
    timestamps: true
});

const Seller = mongoose.model('Seller', sellerSchema);

module.exports = Seller;