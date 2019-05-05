const jwt = require('jsonwebtoken');
const JWT_SECRET = require('../config/global').JWT_SECRET;

module.exports = function(req, res, next) {
  // Get token from header

  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorisation denied' });
  }

  // Verify the token

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (error) {
    return res.status(401).json({ msg: 'Invalid token' });
  }
};
