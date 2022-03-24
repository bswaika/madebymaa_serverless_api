const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    entity: {
        type: String,
        required: [true, 'FCM Token must belong to an entity'],
        enum: ['user', 'seller', 'partner']
    },
    token: {
        type: String,
        required: [true, 'FCM Token must have a valid token']
    },
    firebaseID: {
        type: String,
        required: [true, 'FCM Token entity must have a valid firebaseID']
    }
}, {
    timestamps: true
});

const Token = mongoose.model('Token', tokenSchema);

module.exports = Token;