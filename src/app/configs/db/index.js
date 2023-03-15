const mongoose = require("mongoose");
const ENVIRONMENT = require("../../environments/environment");

async function connection() {
  const connectionParams = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  try {
    mongoose.connect(ENVIRONMENT.MONGODB_URL, connectionParams);
    console.log("connect successfull");
  } catch (error) {
    console.log(error);
    console.log("connect successfull");
  }
}

module.exports = { connection };
