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
      // First: Match votes (optional, if you want to filter candidates)
      // { $match: { position: "Governor" } },

      // Parallel pipelines — city and brgy breakdown
      {
        $facet: {
          votesPerCity: [
            {
              $group: {
                _id: {
                  candidate: "$candidate",
                  city: "$city",
                },
                totalVotes: { $sum: "$votes" },
                position: { $first: "$position" },
                district: { $first: "$district" },
              },
            },
            {
              $group: {
                _id: "$_id.candidate",
                position: { $first: "$position" },
                district: { $first: "$district" },
                votesPerCity: {
                  $push: {
                    city: "$_id.city",
                    totalVotes: "$totalVotes",
                  },
                },
                totalVotes: { $sum: "$totalVotes" },
              },
            },
          ],
          votesPerBrgy: [
            {
              $group: {
                _id: {
                  candidate: "$candidate",
                  barangay: "$barangay",
                },
                totalVotes: { $sum: "$votes" },
                position: { $first: "$position" },
                district: { $first: "$district" },
              },
            },
            // Match to exclude empty or null barangay values
            {
              $match: {
                "_id.barangay": { $ne: "", $exists: true },
              },
            },
            {
              $group: {
                _id: "$_id.candidate",
                position: { $first: "$position" },
                district: { $first: "$district" },
                votesPerBrgy: {
                  $push: {
                    barangay: "$_id.barangay",
                    totalVotes: "$totalVotes",
                  },
                },
              },
            },
          ],
        },
      },

      // Merge both facets into one doc per candidate
      {
        $project: {
          combined: {
            $map: {
              input: "$votesPerCity",
              as: "city",
              in: {
                name: "$$city._id",
                position: "$$city.position",
                district: "$$city.district",
                totalVotes: "$$city.totalVotes",
                votesPerCity: "$$city.votesPerCity",
                votesPerBrgy: {
                  $let: {
                    vars: {
                      barangay: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: "$votesPerBrgy",
                              as: "barangay",
                              cond: { $eq: ["$$barangay._id", "$$city._id"] },
                            },
                          },
                          0,
                        ],
                      },
                    },
                    in: "$$barangay.votesPerBrgy",
                  },
                },
              },
            },
          },
        },
      },
      {
        $unwind: "$combined",
      },
      {
        $replaceRoot: { newRoot: "$combined" },
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
