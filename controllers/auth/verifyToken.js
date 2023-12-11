const { fetchUserByToken,deleteUserToken } = require("../../services/User");

async function verifyTokenController(req, res) {
  try {

    const { token } = req.query;
    if (!token) {
      return res.status(400).json({
        error: "Bad Request",
        message: "No token provided",
        statusCode: 400,
      });
    }

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
  } 
  catch (err) {
    throw err;
  }
}

module.exports = verifyTokenController;