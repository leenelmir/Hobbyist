const jwt = require('jsonwebtoken');
const config = require('config');

const authenticateUser = (req, res, next) => {
 
  const token = req.cookies.token; 
  console.log(req.cookies.token);
  if (token == null) {
    return res.sendStatus(401);
  }

  jwt.verify(token, config.get("jwtPrivateKey"), (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    console.log(user._id + " " + req.user.username);
    next();
  });
};

module.exports = authenticateUser;
