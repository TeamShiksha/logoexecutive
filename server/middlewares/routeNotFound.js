const routeNotFound = (_req, res, next) => {
  res
    .status(404)
    .json({ statusCode: 404, message: "route not found", error: "not found" });
  next();
};

module.exports = routeNotFound;
