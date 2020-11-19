const log4js = require('log4js');
const config = require('../config');

log4js.configure({
  appenders: { out: { type: 'stdout' } },
  categories: { default: { appenders: ['out'], level: config.LOG_LEVEL } }
});

const logger = log4js.getLogger();
module.exports = logger;
