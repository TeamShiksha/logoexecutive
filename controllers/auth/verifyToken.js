const { STATUS_CODES } = require("http");
const { fetchTokenFromId, deleteUserToken } = require("../../services/UserToken");

async function verifyTokenController(req, res, next) {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({
        error: STATUS_CODES[400],
        message: "No token provided",
        statusCode: 400,
      });
    }

    const userToken = await fetchTokenFromId(token);
    if(!userToken)
      return res.status(400).json({
        error: STATUS_CODES[400],
        message: "Token does not exists",
        statusCode: 400
      });

    if(userToken.isExpired())
      return res.status(403).json({
        error: STATUS_CODES[403],
        message: "User token expired",
        statusCode: 403
      });

    const user = await fetchUserFromId(userToken.userId);
    if (!user)
      return res.status(400).json({
        error: STATUS_CODES[400],
        message: "User no longer exists",
        statusCode: 400,
      });

    const result = await deleteUserToken(token);
    if(!result.success)
      return res.status(500).json(result.data);

    return res.status(200).json({message: "User verified succesfully"});
  }
  catch (err) {
    next(err);
  }
}

module.exports = verifyTokenController;
