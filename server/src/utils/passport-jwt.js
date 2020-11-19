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
    const username = payload['cognito:username'] || payload.username;
    if (!username) {
      throw new Error('ERROR_INVALID_TOKEN', 401);
    }
    req.user = {
      id: username,
      role: payload['custom:role'] || 'USER',
      token
    };

    next();
  } catch (error) {
    res.status(error.status || 500);
    res.json({ error: error.message });
  }
};
