const jwt = require('jsonwebtoken');
const config = require('config');

const authenticateUser = (req, res, next) => {
  const authHeader = req.headers['x-auth-token'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.sendStatus(401);
  }

  jwt.verify(token, config.get("jwtPrivateKey"), (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
};

module.exports = authenticateUser;
