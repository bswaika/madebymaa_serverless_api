const { Order } = require('../models');

const todayTimestamp = new Date().setUTCHours(0, 0, 0, 0);
const yesterdayTimestamp = todayTimestamp - (1000 * 60 * 60 * 24);
const weekTimestamp = todayTimestamp - (1000 * 60 * 60 * 24 * 7);
const monthTimestamp = todayTimestamp - (1000 * 60 * 60 * 24 * 28);

const convertTimestamp = (timestamp) => new Date(new Date(timestamp).toISOString());

const TODAY = convertTimestamp(todayTimestamp);
const YESTERDAY = convertTimestamp(yesterdayTimestamp);
const WEEK = convertTimestamp(weekTimestamp);
const MONTH = convertTimestamp(monthTimestamp);

const orders = async(req, res) => {
    let stats;
    try {
        if (req.query.view == 'DAILY' || req.query.view == 'WEEKLY' || req.query.view == 'MONTHLY') {
            let VIEW;
            switch (req.query.view) {
                case 'DAILY':
                    VIEW = YESTERDAY;
                    break;
                case 'WEEKLY':
                    VIEW = WEEK;
                    break;
                case 'MONTHLY':
                    VIEW = MONTH;
                    break;
            }
            stats = await Order.aggregate([{
                $match: {
                    updatedAt: {
                        $gte: VIEW,
                        $lt: TODAY
                    },
                    status: 'ORDER_DELIVERED'
                }
            }, {
                $group: {
                    _id: '$userID',
                    count: {
                        $sum: 1
                    },
                    total: {
                        $sum: '$bill.net'
                    },
                    platform: {
                        $sum: '$bill.tax.sgst'
                    },
                    partner: {
                        $sum: '$bill.deliveryCharge'
                    },
                    vendor: {
                        $sum: '$bill.total'
                    }
                }
            }, {
                $project: {
                    count: 1,
                    total: 1,
                    platform: 1,
                    partner: 1,
                    vendor: 1,
                    _id: 0
                }
            }]);
        } else {
            stats = await Order.aggregate([{
                $match: {
                    updatedAt: {
                        $gte: TODAY
                    },
                    status: 'ORDER_DELIVERED'
                }
            }, {
                $group: {
                    _id: '$userID',
                    count: {
                        $sum: 1
                    },
                    total: {
                        $sum: '$bill.net'
                    },
                    platform: {
                        $sum: '$bill.tax.sgst'
                    },
                    partner: {
                        $sum: '$bill.deliveryCharge'
                    },
                    vendor: {
                        $sum: '$bill.total'
                    }
                }
            }, {
                $project: {
                    count: 1,
                    total: 1,
                    platform: 1,
                    partner: 1,
                    vendor: 1,
                    _id: 0
                }
            }]);
        }


        const response = {
            users: stats.length,
            orders: stats.reduce((orderTotal, { count }) => orderTotal + count, 0),
            sales: stats.reduce((salesTotal, { total }) => salesTotal + total, 0),
            earnings: {
                platform: stats.reduce((platformTotal, { platform }) => platformTotal + platform, 0),
                partner: stats.reduce((partnerTotal, { partner }) => partnerTotal + partner, 0),
                vendor: stats.reduce((vendorTotal, { vendor }) => vendorTotal + vendor, 0),
            }
        };

        return res.status(200).json({
            message: 'Order Stats fetched successfully...',
            body: {
                stats: response
            }
        });

    } catch (err) {
        return res.status(500).json({
            message: 'DB error...',
            debugInfo: err.message
        });
    }
};

module.exports = {
    orders
}