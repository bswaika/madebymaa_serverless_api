const { Split, Seller } = require('../models');
const https = require('https');

const key = 'some_key'
const secret = 'some_secret'

const API_URL = `https://${key}:${secret}@api.razorpay.com/v1/payments`

const fetch = (requestURL) => {
    return new Promise((resolve, reject) => {
        https.get(requestURL, (response) => {
            let data = '';
            response.on('data', (chunk) => {
                data += chunk;
            });
            response.on('end', () => {
                resolve(JSON.parse(data))
            });
        }).on("error", (err) => {
            reject(err)
        });
    })
}

const status = async(paymentID) => {
    return (await fetch(`${API_URL}/${paymentID}`)).status.toUpperCase()
}

const getAll = async(req, res) => {
    try {
        const splits = await Split.find({}).sort('-createdAt').select('-__v').lean();
        const settlements = await Promise.all(splits.map(async(split) => {
            const { name, kitchenName } = await Seller.findOne({ firebaseID: split.sellerID });
            const rzpStatus = await status(split.paymentID)
            return {
                ...split,
                rzpStatus,
                name,
                kitchenName
            }
        }))
        const totalSettled = (splits.filter(({ status }) => status))
            .reduce((total, { amount }) => total + amount, 0);
        const totalPending = (splits.filter(({ status }) => !status))
            .reduce((total, { amount }) => total + amount, 0);
        if (!settlements.length) {
            return res.status(404).json({
                message: 'No Settlement found ...'
            });
        }

        return res.status(200).json({
            message: 'Settlement information fetched successfully...',
            body: {
                settlements,
                totalPending,
                totalSettled,
                count: settlements.length
            }
        });
    } catch (err) {
        return res.status(500).json({
            message: 'DB error...',
            debugInfo: err.message
        });
    }
}

module.exports = { getAll };