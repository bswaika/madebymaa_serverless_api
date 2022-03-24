const mongoose = require('mongoose');

const partnerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Partner should have a name!']
    },
    firebaseID: {
        type: String,
        unique: [true, 'Partner should be unique on Firebase!'],
        required: [true, 'Partner should be logged in by Firebase!']
    },
    onlineStatus: {
        type: Boolean,
        default: false,
    },
    partnerStatus: {
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
        unique: [true, 'Partner should have a unique email!'],
        required: [true, 'Partner should have a email!']
    },
    dob: Date,
    address: {
        type: String,
        required: [true, 'Partner should have a address!']
    },
    pin: {
        type: Number,
        required: [true, 'Partner should have a pin!']
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
    }
}, {
    timestamps: true
});

const Partner = mongoose.model('Partner', partnerSchema);

module.exports = Partner;