const JWT = require("jsonwebtoken");
const http = require("http");


module.exports = function (req, res, next) {
  try {
    const { jwt } = req.cookies;

    if(!jwt) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "User not signed in",
        statusCode: 401
      });
    }

    const decodedData = JWT.verify(jwt, process.env.JWT_SECRET);

    const { data } = decodedData;
    if(!data || !data.email || !data.id)
      return res.status(403).json({
        error: http.STATUS_CODES[403],
        message: "Invalid credentials",
        statusCode: 403
      });

    Object.assign(req, { userData: decodedData.data });
    next();
  } catch (err) {
    console.log(err);
    throw err;
  }
};
