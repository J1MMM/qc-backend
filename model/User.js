const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  pcosNo: {
    type: String,
    required: true,
  },
  precinctNo: {
    type: String,
    required: true,
  },
  barangay: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  district: {
    type: String,
    required: true,
  },
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  middlename: String,
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },

  refreshToken: String,

  archive: {
    type: Boolean,
    require: true,
    default: false,
  },
});

module.exports = mongoose.model("User", userSchema);
