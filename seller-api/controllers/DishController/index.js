const create = require('./create');
const update = require('./update');
const {get, getAll } = require('./get');
const remove = require('./remove');
const today = require('./today');

module.exports = {
    create,
    update,
    get,
    getAll,
    remove,
    today
};