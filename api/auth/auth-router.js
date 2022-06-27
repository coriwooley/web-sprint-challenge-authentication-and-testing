const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = require("express").Router();
const Users = require("../users/users-model");

const { JWT_SECRET, BCRYPT_ROUNDS } = require("../config/index");
const { uniqueName, validInput, validUsername } = require("./auth-middleware");

router.post("/register", validInput, uniqueName, (req, res, next) => {
  const { username, password } = req.body;
  const hash = bcrypt.hashSync(password, BCRYPT_ROUNDS);

  Users.create({ username, password: hash })
    .then((newUser) => {
      res.status(201).json(newUser);
    })
    .catch(next);
});

router.post("/login", validInput, validUsername, (req, res, next) => {
  if (bcrypt.compareSync(req.body.password, req.user.password)) {
    const token = generateToken(req.user);
    res.json({ status: 200, message: `welcome, ${req.user.username}`, token });
  } else {
    next({ status: 401, message: "invalid credentials" });
  }
});

const generateToken = (user) => {
  const payload = {
    subject: user.id,
    username: user.username,
  };

  const options = {
    expiresIn: "1d",
  };
  return jwt.sign(payload, JWT_SECRET, options);
};

module.exports = router;
