import { ConfigurationError } from '../../core/errors';

const environment = process.env.NODE_ENV || 'production';
if (['development', 'test', 'production'].indexOf(environment) < 0) {
  throw new ConfigurationError(`Unexpected NODE_ENV environement var, current value "${environment}", expect 'development', 'test' or 'production'`);
}

const databaseMain = process.env.DATABASES_MAIN || '';
if (!databaseMain) throw new ConfigurationError('DATABASES_MAIN environement var error, current value is missing or empty');

const port = process.env.WEB_PORT || 3000;
if (!port || !port.match(/^\d+$/)) throw new ConfigurationError(`Unexpected WEB_PORT environement var, current value "${port}", expect an integer`);

const secretJwt = process.env.TOKEN_SECRET || '';
if (!secretJwt) throw new ConfigurationError('TOKEN_SECRET environement var error, current value is missing or empty');

const webUrl = process.env.WEB_URL || '';
if (!webUrl) throw new ConfigurationError('WEB_URL environement var error, current value is missing or empty');

const logsPath = process.env.LOG_PATH || '';
if (!logsPath) throw new ConfigurationError('LOG_PATH environement var error, current value is missing or empty');

module.exports = {
  databases: {
    main: databaseMain,
  },
  databasesModels: {
    '*': process.env.DATABASES_MODELS_DEFAULT || 'main',
    user: 'main',
  },
  debug: environment === 'development',
  environment,
  jwt: {
    secret: secretJwt,
    getName: 'access_token',
  },
  logs: {
    transporters: {
      file: {
        transport: 'file',
        options: {
          filename: `${logsPath}/default.log`,
          level: environment === 'production' ? 'info' : 'error',
        },
      },
      console: {
        transport: 'console',
        options: {
          level: environment === 'production' ? 'info' : 'silly',
        },
      },
    },
    loggers: {
      controller: [
        {
          transporter: 'file',
          options: { filename: `${logsPath}/controller.log` },
        }, {
          transporter: 'console',
          options: { message_prefix: 'controller' },
        },
      ],
      core: [
        {
          transporter: 'file',
          options: { filename: `${logsPath}/server.log` },
        }, {
          transporter: 'console',
          options: { message_prefix: 'server' },
        },
      ],
      request: [
        {
          transporter: 'file',
          options: { filename: `${logsPath}/requests.log` },
        }, {
          transporter: 'console',
          options: { message_prefix: 'request' },
        },
      ],
      services: [
        {
          transporter: 'file',
          options: { filename: `${logsPath}/service.log` },
        }, {
          transporter: 'console',
          options: { message_prefix: 'service' },
        },
      ],
    },
  },
  port,
  urls: {
    root: webUrl,
    root_path: '/api/v1',
  },
};
