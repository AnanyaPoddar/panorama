const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  password: {
    required: false,
    type: String,
  },
  email: {
    required: true,
    type: String,
  },
  isLinkedinUser: {
    required: false,
    type: Boolean,
  },
  linkedinId: {
    required: false,
    type: String,
  },
  firstname: {
    required: true,
    type: String,
  },
  lastname: {
    required: true,
    type: String,
  },
  dob: {
    required: false,
    type: Date,
  },
  dp: {
    required: false,
    type: String,
  },
  isVerified: {
    required: false,
    type: Boolean,
  },
});

module.exports = mongoose.model("Users", userSchema);
