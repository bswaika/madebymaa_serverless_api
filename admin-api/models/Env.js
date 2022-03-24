const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
    key: String,
    value: Number
});

const Env = mongoose.model('Env', configSchema);

module.exports = Env;