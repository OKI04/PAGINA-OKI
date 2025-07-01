const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/auth.controller");
const validateToken = require("../middlewares/validateToken");

router.post("/register", validateToken.authRequired ,AuthController.register);
router.post("/login", AuthController.login);
router.post("/logout", AuthController.logout);

module.exports = router;