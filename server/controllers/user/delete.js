const { STATUS_CODES } = require("http");
const { deleteUserAccount } = require("../../services");


async function deleteUserAccountController(req, res, next) {
  const { userId } = req.userData;

  try {
    await deleteUserAccount(userId);
    res.status(200).json({
      status: 200,
      message: STATUS_CODES[200],
      data: { message: "Your user data has been successfully deleted from our system." },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = deleteUserAccountController;
