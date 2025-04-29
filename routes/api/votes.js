const express = require("express");
const {
  addVotes,
  getTotalVotes,
  getTally,
} = require("../../controllers/votesController");

const router = express.Router();

router.route("/").post(addVotes);
router.route("/users/getVotes").post(getTotalVotes);
router.route("/admin/getVotes").post(getTally);

module.exports = router;
