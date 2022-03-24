const mongoose = require('mongoose');

const db = mongoose
    .connect(process.env.DB, {
        useNewUrlParser: true,
        useUnifiedTopology: false,
        useCreateIndex: true,
        useFindAndModify: false
    })
    .then(() => console.log('Successfully connected to MongoDB...'))
    .catch((err) => console.log('Error connecting to MongoDB...', err));

module.exports = db