const User = require("../../models/user");

const userController = {
  getAllUser: async (req, res) => {
    const user = await User.find();

    res.status(200).json(
      user.map((item) => {
        return {
          name: item.name,
          email: item.email,
        };
      })
    );
  },
};

module.exports = userController;
