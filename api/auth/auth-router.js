const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = require("express").Router();
const Users = require("../users/users-model");

const { JWT_SECRET, BCRYPT_ROUNDS } = require("../config/index");
const { uniqueName, validInput, validUsername } = require("./auth-middleware");

router.post("/register", validInput, uniqueName, async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const hash = bcrypt.hashSync(password, BCRYPT_ROUNDS);

    const newUser = Users.create({ username, password: hash });
    res.status(201).json(newUser);
  } catch (err) {
    next(err);
  }
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
