const bcrypt = require("bcrypt");
const User = require("../model/User");
const nodeMailer = require("nodemailer");
const ROLES_LIST = require("../config/roles_list");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "Admin" } }); // exclude admin

    if (!users || users.length === 0) {
      return res.status(204).json({ message: "No users found" });
    }

    res.json(users);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const checkEmailDuplication = async (req, res) => {
  try {
    const result = await User.find({ email: req.body.email });
    res.json(result);
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const accountDetails = req.body;
    if (!accountDetails)
      return res.status(400).json({ message: "All fields are required" });

    const duplicate = await User.findOne({
      email: accountDetails.email,
    }).exec();

    const pcosDuplicate = await User.findOne({
      pcosNo: accountDetails.pcosNo,
    }).exec();
    if (duplicate || pcosDuplicate)
      return res
        .status(409)
        .json({ message: "This PCOS No. or Email Address is Already in use" }); //confilict

    const hashedPwd = await bcrypt.hash(accountDetails.password, 10);

    const result = await User.create({
      ...accountDetails,
      password: hashedPwd,
    });

    res.status(201).json({
      success: `New user has been created successfully!`,
      result,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
const updateUser = async (req, res) => {
  const recordData = req.body;

  try {
    const record = await Record.findById(recordData?.id);
    if (!record) {
      return res.status(404).json({ message: "user's data not found." });
    }

    record.set(recordData);

    await record.save();
    res.json({ message: "The user's data was updated successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.body;
  if (!id) return res.sendStatus(400);

  try {
    await User.deleteOne({ _id: id });

    const result = await User.find();
    res.json({ result, message: "User's data was deleted successfully." });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};

const archiveUser = async (req, res) => {
  const { idsToDelete, toAchive } = req.body;
  if (!idsToDelete || !req.id)
    return res.status(400).json({ message: "id's are required" });

  const updateOperation = {
    $set: {
      archive: toAchive ? true : false,
    },
  };

  try {
    await User.updateMany({ _id: { $in: idsToDelete } }, updateOperation);
    const users = await User.find();

    res.json(users);
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: error.message });
  }
};

const getUser = async (req, res) => {
  const { id } = req.params;
  if (!id) return res.sendStatus(400);

  try {
    const user = await User.findOne({ _id: id });
    if (!user) return res.sendStatus(204);
    res.json(user);
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getUser,
  archiveUser,
  checkEmailDuplication,
};
