const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/auth.controller");
const validateToken = require("../middlewares/validateToken");

router.post("/register", validateToken.authRequired ,AuthController.register);
router.post("/login", AuthController.login);
router.post("/logout", AuthController.logout);
router.get("/verify", validateToken.authRequired, AuthController.verifyToken);

module.exports = router;