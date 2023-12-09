const JWT = require("jsonwebtoken");
const http = require("http");


module.exports = function (req, res, next) {
  try {
    const { jwt } = req.cookies;

    if(!jwt)
      return res.bang.unauthorized("User not signed in");

    const decodedData = JWT.verify(jwt, process.env.JWT_SECRET);

    const { data } = decodedData;
    if(!data || !data.email || !data.userId)
      return res.bang.forbidden("Invalid credentials");

    Object.assign(req, { userData: decodedData.data });
    next();
  } catch (err) {
    console.log(err);
    throw err;
  }
};
