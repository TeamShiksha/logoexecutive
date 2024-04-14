const { STATUS_CODES } = require("http");

function signoutController(req, res) {
  try {
    const { jwt } = req.cookies;
    if (!jwt) {
      return res.status(400).json({
        error: STATUS_CODES[400],
        message: "Failed to validate user session",
        statusCode: 400,
      });
    }

    res.clearCookie("jwt");
    res.status(205);
    res.send();
  } catch (err) {
    next(err);
  }
}

module.exports = signoutController;
