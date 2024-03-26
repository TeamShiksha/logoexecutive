const { STATUS_CODES } = require("http");
const { deleteUserAccount } = require("../../services");


async function deleteUserAccountController(req, res, next) {
  const { userId } = req.userData;

  try {
    await deleteUserAccount(userId);
    res.status(200).json({
      status: 200,
      message: STATUS_CODES[200],
      data: { message: "The deletion of user data has been completed successfully." },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = deleteUserAccountController;
