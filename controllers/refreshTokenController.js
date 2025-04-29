const jwt = require("jsonwebtoken");
const User = require("../model/User");

const handleRefreshToken = async (req, res) => {
  try {
    const cookies = req.cookies;

    if (!cookies?.jwt) return res.sendStatus(401);

    const refreshToken = cookies.jwt;
    const foundUser = await User.findOne({ refreshToken }).exec();
    if (!foundUser) return res.sendStatus(403);

    const fullname = `${foundUser.firstname} ${foundUser.lastname}`;
    const email = foundUser.email;
    const id = foundUser._id;
    // evaluate jwt
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        if (err || decoded.email !== foundUser.email)
          return res.sendStatus(403);
        const accessToken = jwt.sign(
          {
            UserInfo: {
              id: id,
              fullname: fullname,
              email: foundUser.email,
              role: foundUser.role,
              email: foundUser.email,
              pcosNo: foundUser.pcosNo,
              precinctNo: foundUser.precinctNo,
              district: foundUser.district,
              barangay: foundUser.barangay,
              city: foundUser.city,
            },
          },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "7d" }
        );

        res.json({
          id,
          fullname,
          email: foundUser.email,
          role: foundUser.role,
          pcosNo: foundUser.pcosNo,
          precinctNo: foundUser.precinctNo,
          district: foundUser.district,
          barangay: foundUser.barangay,
          city: foundUser.city,
          accessToken,
        });
      }
    );
  } catch (error) {
    console.error("Login Error: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { handleRefreshToken };
