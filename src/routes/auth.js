const express = require("express");
const router = express.Router();

const authController = require("../app/controllers/authController");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/change-password", authController.changePassword);
router.post("/reset-password", authController.resetPassword);
router.post("/send-code-reset", authController.sendCodeResetPassword);
router.get("/email/verify/:token", authController.verifyAccount);

module.exports = router;
