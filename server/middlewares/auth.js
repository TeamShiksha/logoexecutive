const JWT = require("jsonwebtoken");
const { STATUS_CODES } = require("http");
const { UserType } = require("../utils/constants");

/**
 * @param {Object} options
 * @param {boolean} options.adminOnly
 **/
module.exports = (options = {}) => {
  return function (req, res, next) {
    try {
      const { jwt } = req.cookies;

      if (!jwt) {
        return res.status(401).json({
          error: STATUS_CODES[401],
          message: "User not signed in",
          statusCode: 401,
        });
      }

      const decodedData = JWT.verify(jwt, process.env.JWT_SECRET);

      const { data } = decodedData;
      if (!data || !data.email || !data.userId)
        return res.status(403).json({
          error: STATUS_CODES[403],
          message: "Invalid credentials",
          statusCode: 403,
        });

      if (options.adminOnly && data.userType !== UserType.ADMIN)
        return res.status(401).json({
          error: STATUS_CODES[401],
          message: "User not authorized",
          statusCode: 401,
        });

      Object.assign(req, { userData: decodedData.data });
      next();
    } catch (err) {
      next(err);
    }
  };
};
