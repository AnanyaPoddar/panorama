const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  id: {
    required: true,
    type: String,
  },
  participants: {
    default: [],
    type: Array,
  },
  participantEmails: {
    default: [],
    type: Array,
  },
  //added idea of host
  host: {
    type: String,
  },
});

module.exports = mongoose.model("Rooms", roomSchema);
