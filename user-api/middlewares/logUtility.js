const logUtility = async(req, res, next) => {
    if (req.body) {
        console.log('DEBUG LOG------------------------');
        console.log(req.body);
        console.log('END OF LOG-----------------------');
    }
    next();
}

module.exports = logUtility;