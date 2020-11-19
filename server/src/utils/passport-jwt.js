const jwtDecode = require('jwt-decode');

module.exports = () => async (req, res, next) => {
  try {
    const token =
      req.headers.Authorization || req.headers.authorization || req.headers.jwt || req.query.jwt;
    if (!token) {
      throw new Error('ERROR_INVALID_TOKEN', 401);
    }
    const payload = jwtDecode(`${token}`.replace(/^Bearer /g, ''));
    if (!payload) {
      throw new Error('ERROR_INVALID_TOKEN', 401);
    }
    const email = payload['cognito:email'] || payload.email;
    if (!email) {
      throw new Error('ERROR_INVALID_TOKEN', 401);
    }
    req.user = {
      email,
      token
    };

    next();
  } catch (error) {
    res.status(error.status || 500);
    res.json({ error: error.message });
  }
};
