const { Env } = require('../models');

const getAll = async(req, res) => {
    try {
        const envs = await Env.find({});
        if (!envs) {
            return res.status(404).json({
                message: 'No Key found...'
            });
        }

        return res.status(200).json({
            message: 'Key information fetched successfully...',
            body: {
                envs
            }
        });
    } catch (err) {
        return res.status(500).json({
            message: 'DB error...',
            debugInfo: err.message
        });
    }
}

const update = async(req, res) => {
    try {
        const env = await Env.findOneAndUpdate({ key: req.body.key }, { value: req.body.value }, {
            new: true,
            runValidators: true
        });

        if (!env) {
            return res.status(404).json({
                message: 'No Key found...'
            });
        }

        return res.status(200).json({
            message: 'Key information updated successfully...',
            body: {
                env
            }
        });
    } catch (err) {
        return res.status(500).json({
            message: 'DB error...',
            debugInfo: err.message
        });
    }
}


module.exports = {
    getAll,
    update
};