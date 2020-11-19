const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const mybatisMapper = require('mybatis-mapper');
const log4js = require('log4js');
const _ = require('lodash');
const config = require('../config');

const logger = log4js.getLogger();
const { NODE_ENV } = config;
const dbConfig = config[NODE_ENV];

console.log('Successfully connected to DB:', dbConfig.host, dbConfig.port); // eslint-disable-line

/**
 * Converts the field value based on what is defined
 * from the open-api data-type
 *
 * @link https://swagger.io/specification/#data-types
 * @example
 *   parsedItems[key] = parseSingleField({ schema, key, item });
 */
const parseSingleField = ({ schema, key, item }) => {
  if (_.isFunction(schema[key].get)) {
    return schema[key].get(item);
  }
  const format = schema[key].format || schema[key].type;
  switch (format) {
    case 'object':
      return {};
    case 'string':
      return item[key] === undefined || item[key] === null ? null : `${item[key]}`;
    case 'integer':
    case 'int32':
    case 'int64':
      return item[key] === undefined || item[key] === null ? null : parseInt(item[key], 10);
    case 'number':
    case 'float':
    case 'doable':
      return item[key] === undefined || item[key] === null ? null : parseFloat(item[key]);
    case 'boolean':
      return item[key] === undefined || item[key] === null ? null : !!item[key];
    default:
      return item[key];
  }
};

const generateObjectMapper = schema => item => {
  const keys = Object.keys(schema);
  const parsedItems = {};
  keys.forEach(key => {
    parsedItems[key] = parseSingleField({ schema, key, item });
  });
  return parsedItems;
};

class DatabaseUtil {
  constructor() {
    this.readPool = new Pool({
      host: dbConfig.host,
      user: dbConfig.username,
      database: dbConfig.database,
      password: dbConfig.password,
      port: dbConfig.port,
      max: dbConfig.max_connection,
      idleTimeoutMillis: dbConfig.idle_timeout,
      connectionTimeoutMillis: dbConfig.connection_timeout
    });
    this.writePool = new Pool({
      host: dbConfig.host,
      user: dbConfig.username,
      database: dbConfig.database,
      password: dbConfig.password,
      port: dbConfig.port,
      max: dbConfig.max_connection,
      idleTimeoutMillis: dbConfig.idle_timeout,
      connectionTimeoutMillis: dbConfig.connection_timeout
    });

    mybatisMapper.createMapper(
      fs
        .readdirSync(path.join(__dirname, 'mapper'))
        .filter(file => /(.+)\.xml/.test(file))
        .map(file => path.join(__dirname, 'mapper', file))
    );

    this.format = {
      language: 'sql',
      indent: '  '
    };
  }

  readQuery(name, sqlid, params) {
    const query = mybatisMapper.getStatement(name, sqlid, params, this.format);
    logger.debug(`SQL : ${query}`);
    return new Promise((resolve, reject) => {
      this.readPool.connect((err, client, release) => {
        if (err) {
          reject(err);
          return;
        }
        client.query(query, (clientErr, result) => {
          release();
          if (clientErr) {
            reject(clientErr);
            return;
          }
          resolve(result.rows);
        });
      });
    });
  }

  writeQuery(name, sqlid, params) {
    const query = mybatisMapper.getStatement(name, sqlid, params, this.format);
    logger.debug(`SQL : ${query}`);
    return new Promise((resolve, reject) => {
      this.writePool.connect((err, client, release) => {
        if (err) {
          reject(err);
          return;
        }
        client.query(query, (clientErr, result) => {
          release();
          if (clientErr) {
            reject(clientErr);
            return;
          }
          resolve(result);
        });
      });
    });
  }

  findAll(name, sqlid, options) {
    const params = _.get(options, 'params', {});
    const schema = _.get(options, 'schema', {});
    const query = mybatisMapper.getStatement(name, sqlid, params, this.format);
    return new Promise((resolve, reject) => {
      this.readPool.connect((err, client, release) => {
        if (err) {
          reject(err);
          return;
        }
        client.query(query, (clientErr, result) => {
          release();
          if (clientErr) {
            reject(clientErr);
            return;
          }
          if (_.isObject(schema)) {
            const mapper = generateObjectMapper(schema);
            resolve(result.rows.map(mapper));
          }
          resolve(result.rows);
        });
      });
    });
  }

  findOne(name, sqlid, options) {
    const params = _.get(options, 'params', {});
    const schema = _.get(options, 'schema', {});
    const nullOnEmpty = _.get(options, 'nullOnEmpty', true);
    const query = mybatisMapper.getStatement(name, sqlid, params, this.format);
    return new Promise((resolve, reject) => {
      this.readPool.connect((err, client, release) => {
        if (err) {
          reject(err);
          return;
        }
        client.query(query, (clientErr, result) => {
          release();
          if (clientErr) {
            reject(clientErr);
            return;
          }
          const item = result.rows.length ? result.rows[0] : null;
          if (item && _.isObject(schema)) {
            const mapper = generateObjectMapper(schema);
            resolve(mapper(item));
          }
          if (!nullOnEmpty && _.isNull(item)) {
            const mapper = _.isObject(schema) ? generateObjectMapper(schema) : data => data;
            resolve(mapper({}));
          }
          resolve(item);
        });
      });
    });
  }

  async end() {
    await this.readPool.end();
    await this.writePool.end();
  }
}

const instance = new DatabaseUtil();

module.exports = instance;
