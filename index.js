const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const db = require("./src/app/configs/db");
const route = require("./src/routes");

dotenv.config();

const app = express();
const port = 9000;

db.connection();

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(express.json());
app.use(cors());
app.use(morgan("common"));

route(app);

app.listen(process.env.PORT || port, () => {
  console.log(`Example app listening on port ${port}`);
});
