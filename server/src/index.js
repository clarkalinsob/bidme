const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const log4js = require('log4js');

const config = require('./config');
const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const logger = log4js.getLogger();
logger.level = config.LOG_LEVEL;

app.get('/', async (req, res) => {
  return res.json({
    message: `Welcome to BidMe`
  });
});

module.exports = app;
