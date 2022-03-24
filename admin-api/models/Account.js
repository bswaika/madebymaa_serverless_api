const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    accountID: {
        type: String,
        required: [true, 'Account must have a valid accountID'],
        unique: [true, 'Acount must have a unique accountID']
    },
    firebaseID: {
        type: String,
        unique: [true, 'Account must have a unique firebaseID'],
        required: [true, 'Account must have a valid firebaseID']
    }
});

const Account = mongoose.model('Account', accountSchema);

module.exports = Account;