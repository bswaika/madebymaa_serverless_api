const { Order, Env } = require('../../models');
const STATUS = require('../../statuscodes');

const todayTimestamp = new Date().setUTCHours(0, 0, 0, 0);
const yesterdayTimestamp = todayTimestamp - (1000 * 60 * 60 * 24);

const convertTimestamp = (timestamp) => new Date(new Date(timestamp).toISOString());

const TODAY = convertTimestamp(todayTimestamp);
const YESTERDAY = convertTimestamp(yesterdayTimestamp);

const todayStats = async(req, res) => {
    const response = {
        message: 'Stats fetched successfully...',
        body: {
            stats: {}
        }
    };
    if (req.stats) {
        response.body.stats.yesterday = {...req.stats.yesterday };
    }
    try {
        const today = await Order.aggregate([{
            $match: {
                sellerID: req.entity.firebaseID,
                updatedAt: {
                    $gte: TODAY
                },
                status: {
                    $in: [
                        STATUS.AWAITING_CONFIRMATION,
                        STATUS.RESTAUTANT_CONFIRMED,
                        STATUS.AWAITING_DELIVERY_PARTNER,
                        STATUS.PARTNER_CONFIRMED,
                        STATUS.ORDER_PICKED_UP,
                        STATUS.ORDER_DELIVERED
                    ]
                }
            }
        }, {
            $group: {
                _id: '$status',
                count: {
                    $sum: 1
                }
            }
        }, {
            $project: {
                status: '$_id',
                count: 1,
                _id: 0
            }
        }]);

        let live = 0,
            pending = 0,
            ready = 0,
            delivered = 0;
        today.forEach(({ status, count }) => {
            if (status == STATUS.AWAITING_CONFIRMATION) live += count;
            if (status == STATUS.RESTAUTANT_CONFIRMED) pending += count;
            if (status == STATUS.AWAITING_DELIVERY_PARTNER || status == STATUS.PARTNER_CONFIRMED) ready += count;
            if (status == STATUS.ORDER_PICKED_UP || status == STATUS.ORDER_DELIVERED) delivered += count;
        });
        response.body.stats.today = {
            live,
            pending,
            ready,
            delivered
        }
        return res.status(200).json(response);
    } catch (err) {
        return res.status(500).json({
            message: 'DB error...',
            debugInfo: err.message
        });
    }
}

const yesterdayStats = async(req, res, next) => {
    try {
        const SPLIT_FACTOR = await Env.findOne({ key: 'SPLIT_FACTOR' }).select('value');
        if (!SPLIT_FACTOR) {
            return res.status(400).json({
                message: 'No SPLIT_FACTOR set. System Failure...'
            });
        }
        const yesterday = await Order.aggregate([{
            $match: {
                sellerID: req.entity.firebaseID,
                updatedAt: {
                    $gte: YESTERDAY,
                    $lt: TODAY
                },
                status: STATUS.ORDER_DELIVERED
            }
        }, {
            $group: {
                _id: '$userID',
                count: {
                    $sum: 1
                },
                total: {
                    $sum: '$bill.total'
                }
            }
        }, {
            $project: {
                count: 1,
                total: 1,
                _id: 0
            }
        }]);

        const stats = {
            yesterday: {}
        };

        stats.yesterday.users = yesterday.length;
        stats.yesterday.orders = yesterday.reduce((orderTotal, { count }) => orderTotal + count, 0);
        stats.yesterday.sales = yesterday.reduce((salesTotal, { total }) => salesTotal + total, 0);

        req.stats = stats;
        next();
    } catch (err) {
        return res.status(500).json({
            message: 'DB error...',
            debugInfo: err.message
        });
    }
}


module.exports = {
    yesterdayStats,
    todayStats
};