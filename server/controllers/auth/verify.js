const { STATUS_CODES } = require("http");
const { verifyUser, fetchUserFromId, 
  fetchTokenFromId, deleteUserToken } = require("../../services");

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
        message: "User Token does not exist",
        statusCode: 400,
      });

    if (userToken.isExpired())
      return res.status(403).json({
        error: STATUS_CODES[403],
        message: "Your User Token has expired",
        statusCode: 403,
      });

    const user = await fetchUserFromId(userToken.userId);
    if (!user)
      return res.status(400).json({
        error: STATUS_CODES[400],
        message: "User no longer exists",
        statusCode: 400,
      });

    const verifyResult = await verifyUser(user);
    if (!verifyResult.success)
      return res.status(500).json({
        error: STATUS_CODES[500],
        message: verifyResult.message,
        statusCode: 500,
      });

    deleteUserToken(userToken).then((result) => {
      if (!result.success)
        console.error(`Token id:${userToken.token} could not be deleted`);
    });

    return res.status(200).json({ message: "User verification successful" });
  } catch (err) {
    next(err);
  }
}

module.exports = verifyTokenController;
