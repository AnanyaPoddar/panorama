const mongoose = require("mongoose");

const linkedinUserSchema = new mongoose.Schema({
  linkedinId: {
    required: true,
    type: String
  },
  email: {
    required: true,
    type: String
  }
});

module.exports = mongoose.model("LinkedinUsers", linkedinUserSchema);
