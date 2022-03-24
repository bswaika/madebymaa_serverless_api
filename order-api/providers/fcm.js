const admin = require('../firebase');

const notify = async(notification, token) => await admin.messaging().send({
    notification,
    android: {
        notification: {
            sound: 'default',
            notification_priority: 'PRIORITY_HIGH'
        }
    },
    token
});

const broadcast = async(notification, tokens) => await admin.messaging().sendMulticast({
    notification,
    android: {
        notification: {
            sound: 'default',
            notification_priority: 'PRIORITY_HIGH'
        }
    },
    tokens
});

module.exports = {
    notify,
    broadcast
}