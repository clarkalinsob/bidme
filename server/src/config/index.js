const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  NODE_PORT: parseInt(process.env.NODE_PORT, 10) || 5000,
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  development: {
    host: process.env.DB_HOST || 'localhost',
    username: process.env.DB_USER || 'pguser',
    password: process.env.DB_PASS || 'password',
    database: process.env.DB_NAME || 'pg_dev',
    dialect: 'postgres',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    max_connection: parseInt(process.env.DB_MAX_CONNECTION, 10) || 20,
    idle_timeout: parseInt(process.env.DB_IDLE_TIMEOUT, 10) || 30000,
    connection_timeout: parseInt(process.env.DB_CONNECTION_TIMEOUT, 10) || 2000
  }
};
