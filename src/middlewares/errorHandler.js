const errorHandler = (err, _req, res, next) => {
  res.status(500).json({ success: false, message: err.message });
  next();
};

module.exports = errorHandler;