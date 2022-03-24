const handleGet = async(req, res) => {
    try {
        if (req.orders) {
            if (req.entity.type == 'admin') {
                // console.log('HELLO! CORS ADDED');
                res.header('Access-Control-Allow-Origin', process.env.ADMIN_APP_DOMAIN);
                res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
            }
            const { orders } = req;
            return res.status(200).json({
                message: 'Order details fetched successfully...',
                body: {
                    orders,
                    count: orders.length
                }
            });
        }
        if (req.order) {
            const { order } = req;
            return res.status(200).json({
                message: 'Order details fetched successfully...',
                body: {
                    order
                }
            });
        }
    } catch (err) {
        console.log(err);
        if (req.entity.type == 'admin') {
            // console.log('HELLO! CORS ADDED');
            res.header('Access-Control-Allow-Origin', process.env.ADMIN_APP_DOMAIN);
            res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
        }
        return res.status(500).json({
            message: 'Internal Server Error...'
        });
    }
}

module.exports = handleGet;