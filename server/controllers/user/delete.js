const { deleteUserAccount } = require("../../services");

async function deleteUserAccountController(req, res, next) {
  const { userId } = req.userData;

  try {
    await deleteUserAccount(userId);
    res.status(200).json({
      status: 200,
      message: "Your user data has been successfully deleted from our system",
    });
  } catch (err) {
    next(err);
  }
}

module.exports = deleteUserAccountController;
