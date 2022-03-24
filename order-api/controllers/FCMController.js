const { FCM } = require('../providers');
const { Token } = require('../models');

const notify = async(req, res) => {
    const { title, body } = req.body;
    const { token } = req.params;
    if (!title || !body || !token) {
        return res.status(400).json({
            message: 'Bad Request. Must have title and text in body and/or tokenId in params...'
        });
    }
    try {
        const result = await FCM.notify({ title, body }, token);
        if (!result) {
            throw new Error('Could not send FCM...');
        }
        return res.status(200).json({
            message: 'FCM sent successfully...'
        });
    } catch (err) {
        return res.status(500).json({
            message: 'Internal Server Error...',
            debugInfo: err.message
        });
    }
}

const broadcast = async(req, res) => {
    const { title, body, tokens } = req.body;
    if (!title || !body || !tokens) {
        return res.status(400).json({
            message: 'Bad Request. Must have title, text and tokens in body...'
        });
    }
    try {
        const result = await FCM.broadcast({ title, body }, tokens);
        if (!result.successCount) {
            throw new Error('Could not send FCM...');
        }
        return res.status(200).json({
            message: `FCM broadcasted successfully to ${result.successCount} participants...`
        });
    } catch (err) {
        return res.status(500).json({
            message: 'Internal Server Error...',
            debugInfo: err.message
        });
    }

}

const refreshFCMToken = async(req, res) => {
    if (!req.body.token) {
        return res.status(400).json({
            message: 'Bad Request. Must have token in body...'
        });
    }
    const session = await Token.startSession();
    try {
        session.startTransaction();
        const token = await Token.findOne({ firebaseID: req.entity.firebaseID, entity: req.entity.type }).session(session);
        if (!token) {
            const doc = await Token.create([{ firebaseID: req.entity.firebaseID, entity: req.entity.type, token: req.body.token }], { session });
            await session.commitTransaction();
            session.endSession();
            return res.status(201).json({
                message: 'FCM Token successfully registered...'
            });
        }
        if (token.token == req.body.token) {
            await session.commitTransaction();
            session.endSession();
            return res.status(200).json({
                message: 'FCM Token same...'
            });
        }
        token.token = req.body.token;
        await token.save();
        await session.commitTransaction();
        session.endSession();
        return res.status(202).json({
            message: 'FCM Token successfully updated...'
        })
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({
            message: 'Internal Server Error...',
            debugInfo: err.message
        })
    }
}

module.exports = {
    notify,
    broadcast,
    refreshFCMToken
}