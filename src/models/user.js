const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: String,
    password: String,
    email: String,
    number: String,
    valid: Boolean,
    codeReset: Number,
    role: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("users", userSchema);
