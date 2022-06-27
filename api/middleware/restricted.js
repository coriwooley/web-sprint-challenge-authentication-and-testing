const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/index");

module.exports = (req, res, next) => {
  const token = req.headers.authorization;
  if (token === undefined) {
    res.status(401).json({ message: "Token is required" });
  } else {
    jwt.verify(token, JWT_SECRET, async (err, decodedToken) => {
      if (err) {
        next({ status: 401, message: "Token Invalid" });
      } else {
        req.decodedToken = decodedToken;
        next();
      }
    });
  }
};
