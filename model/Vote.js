const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const voteSchema = new Schema({
  pcosNo: {
    type: String,
    required: true,
  },
  precinctNo: {
    type: String,
    required: true,
  },
  votes: {
    type: Number,
    required: true,
  },
  candidate: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Vote", voteSchema);
