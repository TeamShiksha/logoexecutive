const { STATUS_CODES } = require("http");
const {
  verifyUser,
  fetchUserFromId,
  fetchTokenFromId,
  deleteUserToken,
} = require("../../services");

async function verifyTokenController(req, res, next) {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(422).json({
        error: STATUS_CODES[422],
        message: "No token provided",
        statusCode: 422,
      });
    }

    const userToken = await fetchTokenFromId(token);
    if (!userToken)
      return res.status(400).json({
        error: STATUS_CODES[400],
        message: "Invalid token",
        statusCode: 400,
      });

    if (userToken.isExpired())
      return res.status(403).json({
        error: STATUS_CODES[403],
        message: "Token expired",
        statusCode: 403,
      });

    const user = await fetchUserFromId(userToken.userId);
    if (!user)
      return res.status(404).json({
        error: STATUS_CODES[404],
        message: "User doesn't exists",
        statusCode: 404,
      });

    const verifyResult = await verifyUser(user);
    if (!verifyResult)
      return res.status(500).json({
        error: STATUS_CODES[500],
        message: "Failed to verify user, try again",
        statusCode: 500,
      });

    const result = await deleteUserToken(userToken);
    if (!result) {
      return res.status(500).json({
        error: STATUS_CODES[500],
        message: "Something went wrong",
        statusCode: 500,
      });
    }

    return res.status(200).json({ message: "Verification successful" });
  } catch (err) {
    next(err);
  }
}

module.exports = verifyTokenController;
