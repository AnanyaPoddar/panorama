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
    required: true,
    type: String
  }, 
  name: {
    required: true,
    type: String
  }
});

module.exports = mongoose.model("Rooms", roomSchema);
