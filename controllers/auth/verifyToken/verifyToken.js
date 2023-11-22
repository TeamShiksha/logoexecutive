const { fetchUserByToken,deleteUserToken } = require("../../../services/User");

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

    const delTokeRes=await deleteUserToken(token);
    if (!delTokeRes.success) {
      return res.status(500).json({
        error: "internal server error",
        message: "Failed to delete token",
        statusCode: 500,
      });
    }

    return res.status(200).json({
      message: "User verified",
    });
  } 
  catch (err) {
    return res.status(500).json({
      error: "internal server error",
      message: "Failed to verify user",
      statusCode: 500,
    });
  }
}

module.exports = verifyTokenController;