const { STATUS_CODES } = require("http");
const { verifyUser, fetchUserFromId, 
  fetchTokenFromId, deleteUserToken } = require("../../services");

async function verifyTokenController(req, res, next) {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(422).json({
        error: "Unprocessable payload",
        message: "No token provided",
        statusCode: STATUS_CODES[422],
      });
    }

    const userToken = await fetchTokenFromId(token);
    if (!userToken)
      return res.status(400).json({
        error: "Bad request",
        message: "Invalid token",
        statusCode: STATUS_CODES[400],
      });

    if (userToken.isExpired())
      return res.status(403).json({
        error: "Forbidden",
        message: "Token expired",
        statusCode: STATUS_CODES[403],
      });

    const user = await fetchUserFromId(userToken.userId);
    if (!user)
      return res.status(404).json({
        error: "Not Found",
        message: "User doesn't exists",
        statusCode: STATUS_CODES[404],
      });

    const verifyResult = await verifyUser(user);
    if (!verifyResult)
      return res.status(500).json({
        error: "Internal server error",
        message: "Failed to verify user, try again",
        statusCode: STATUS_CODES[500],
      });

    const result = await deleteUserToken(userToken);
    if (!result){
      return res.status(500).json({
        error: "Internal server error",
        message: "Something went wrong",
        statusCode: STATUS_CODES[500],
      });
    }

    return res.status(200).json({ message: "Verification successful" });
  } catch (err) {
    next(err);
  }
}

module.exports = verifyTokenController;
