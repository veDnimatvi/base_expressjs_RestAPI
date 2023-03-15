const express = require("express");
const router = express.Router();
const userController = require("../app/controllers/userController");
const middleWareController = require("../app/middlewares/middlewareController");

router.get(
  "/user",
  middleWareController.verifyToken,
  userController.getAllUser
);
module.exports = router;
