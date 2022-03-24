let admin = require("firebase-admin");

let serviceAccount = require("./config/madebymaa-prod-service-account.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

module.exports = admin