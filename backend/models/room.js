const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  id: {
    required: true,
    type: String
  },
  //added idea of host
  host: {
    required: false,
    type: String
  },
  name: {
    required: true,
    type: String
  },
  whitelistedUsers: {
    required: true,
    type: Array
  }
});

module.exports = mongoose.model("Rooms", roomSchema);
