const jwt = require("jsonwebtoken");
const ENVIRONMENT = require("../environments/environment");
const REQUESTMESSAGE = require("../constants/requestMessage");

const middlewareController = {
  verifyToken: (req, res, next) => {
    const token = req.headers.authorization;

    if (token) {
      const accessToken = token.split(" ")[1];
      jwt.verify(accessToken, ENVIRONMENT.SECRET_KEY, (err, user) => {
        if (err) {
          res.status(500).json(REQUESTMESSAGE.INTERNAL_SERVER_ERROR);
        } else {
          req.body = {
            data: req.body,
            user,
          };
          next();
        }
      });
    } else {
      res.status(403).json(REQUESTMESSAGE.UNAUTHORIZE);
    }
  },
};

module.exports = middlewareController;
