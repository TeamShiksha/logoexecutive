const { deleteUserAccount } = require ("../services/User");
const { STATUS_CODES } = require("http");


async function deleteUserAccountController(req, res){
  const { userId } = req.userData;

  try {
    await deleteUserAccount(userId);
    res.status(200).json({ 
      status: 200,
      message: STATUS_CODES[200],
      data: { message: "User data deleted successfully" }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  deleteUserAccountController,
};