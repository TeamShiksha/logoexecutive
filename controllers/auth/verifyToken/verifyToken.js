const { fetchUserByToken,deleteUserToken } = require("../../../services/User");

async function verifyTokenController(req, res) {
  try {
    const { token } = req.query;
    const user = await fetchUserByToken(token);
    if (!user) {
      return res.status(400).json({
        error: "bad request",
        message: "Invalid Token",
        statusCode: 400,
      });
    }
    await deleteUserToken(token);

    return res.status(200).json({
      message: "User verified",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "Internal Server Error",
      message: err.message,
      statusCode: 500,
    });
  }
}

module.exports = verifyTokenController;