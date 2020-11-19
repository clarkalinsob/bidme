const _ = require('lodash');

const createContext = ctx => {
  ctx.setCookie = (name, value, opts = {}) => {
    ctx.res.cookie(
      name,
      value,
      _.defaults(opts, {
        maxAge: 900000,
        httpOnly: true
      })
    );
  };

  ctx.clearCookie = name => {
    ctx.res.clearCookie(name);
  };

  return ctx;
};

Object.assign(module.exports, {
  createContext
});
