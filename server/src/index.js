const express = require('express');
const _ = require('lodash');
const path = require('path');
const requireAll = require('require-all');
const bodyParser = require('body-parser');
const cors = require('cors');
const log4js = require('log4js');

const config = require('./config');
const passportJwt = require('./utils/passport-jwt');
const context = require('./utils/context');
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

const controllers = requireAll({
  dirname: path.resolve(__dirname, 'controllers'),
  filter: /(.+)\.js$/
});
_.each(controllers, controller => {
  _.each(
    Object.values(controller),
    ({ path, method = 'get', roles, resolver: _resolver, requireAuth = true }) => {
      if (!path) throw new Error('Invalid controller path');
      const resolver = async (req, res) => {
        const requestor = req.user;
        try {
          if (roles && !roles.includes(requestor.role)) {
            throw new ServerError('ERROR_UNAUTHORIZED', 401);
          }
          const { _method: method, ...rawInput } = Object.assign(
            {},
            req.params,
            req.query,
            req.body
          );
          const options = { method };
          const ctx = context.createContext({ req, res });
          const data = await _resolver(options, rawInput, ctx);
          res.json(data);
        } catch (err) {
          logger.error(err);
          res.status(err.status || 500);
          res.json({ error: err.message });
        }
      };
      if (requireAuth) {
        app[method](path, passportJwt(), resolver);
      } else {
        app[method](path, resolver);
      }
    }
  );
});

module.exports = app;
