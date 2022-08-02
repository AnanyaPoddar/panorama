const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
    unique: true,
  },
  token: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Tokens", tokenSchema);
