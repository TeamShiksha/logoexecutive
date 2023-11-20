const { fetchUserByToken } = require("../../../services/User");

async function verifyTokenController(req, res) {

  const { token } = req.query;
  const { userRef, user } = await fetchUserByToken(token);
  if (!user) {
    return res.status(400).json({
      error: "bad request",
      message: "Invalid Token",
      statusCode: 400,
    });
  }
    
  await userRef.update({
    token: null,
  });

  return res.status(200).json({
    message: "User verified",
  });
}

module.exports = verifyTokenController;