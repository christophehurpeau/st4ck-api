/*
 * Expose a function to get logger based on config, with specific options
 *
 * @usage:
 * ```
 * const loggerFactory = require('logger');
 * const myLogger = loggerFactory('core', {...});
 * ```
 */
import config from '../../app/config/server';
import LoggerFactory from '../library/logger-factory/logger-factory';
import { ConfigurationError } from '../errors';

const loggerFactory = new LoggerFactory();
loggerFactory.config.setLoggers(config.logs.loggers);
loggerFactory.config.setTransporters(config.logs.transporters);
loggerFactory.setErrorClass(ConfigurationError);

let cache = {};

module.exports = (loggerId, overrideOptions = {}) => {
  const cacheId = loggerId + JSON.stringify(overrideOptions);
  if (!cache.hasOwnProperty(cacheId)) {
    cache[cacheId] = loggerFactory.get(loggerId, overrideOptions);
  }
  return cache[cacheId];
};
