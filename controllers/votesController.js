const Vote = require("../model/Vote");

const addVotes = async (req, res) => {
  try {
    const data = req.body;
    console.log(data);

    await Vote.create(data);

    res.status(201).json({ message: "Vote added successfully" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};

const getTotalVotes = async (req, res) => {
  try {
    const { pcosNo } = req.body;

    const result = await Vote.aggregate([
      {
        $match: { pcosNo: pcosNo },
      },
      {
        $group: {
          _id: "$candidate",
          totalVotes: { $sum: "$votes" },
          position: { $first: "$position" },
        },
      },
      {
        $project: {
          _id: 0, // remove MongoDB default _id
          name: "$_id", // create new field 'name' from '_id'
          totalVotes: 1, // keep totalVotes
          position: 1, // keep position
        },
      },
    ]);

    if (!result.length) {
      return res.status(404).json({ message: "No votes found" });
    }

    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};

const getTally = async (req, res) => {
  try {
    const result = await Vote.aggregate([
      {
        $group: {
          _id: "$candidate",
          totalVotes: { $sum: "$votes" },
          position: { $first: "$position" },
        },
      },
      {
        $project: {
          _id: 0, // remove MongoDB default _id
          name: "$_id", // create new field 'name' from '_id'
          totalVotes: 1, // keep totalVotes
          position: 1, // keep position
        },
      },
    ]);

    if (!result.length) {
      return res.status(404).json({ message: "No votes found" });
    }

    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  addVotes,
  getTotalVotes,
  getTally,
};
