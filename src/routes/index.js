const authRouter = require("./auth");
const userRouter = require("./user");

function route(app) {
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1", userRouter);
}

module.exports = route;
