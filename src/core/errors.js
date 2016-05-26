import errorFactory from './library/errors-factory';
const config = require('./config/errors');
const errors = errorFactory(config);

module.exports = errors;
