const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./utils/swagger");
const { validateEnv } = require("./utils/envSchema");
const routes = require("./routes/index");
const { errorHandler, notFoundHandler } = require("./middlewares/errorHandler");

/**
 * Load environmental variables only if `NODE_ENV` is not "test"
 */
if (process.env.NODE_ENV !== "test") {
  dotenv.config();
  const { error } = validateEnv(process.env);
  if (error) {
    console.error(`Config validation error: ${error.message}`);
    process.exit(1);
  }
  mongoose
    .connect(process.env.MONGO_URL)
    .then(() => console.info("Connected to mongodb.."))
    .catch((err) => {
      console.error("Mongodb connection error:", err.message);
      process.exit(1);
    });
  mongoose.connection.on("error", (err) => {
    console.error("Mongodb runtime error:", err.message);
  });
}

const app = express();
app.use(cookieParser());
app.disable("x-powered-by");
app.use(express.json());
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/", routes);
app.use(notFoundHandler);
app.use(errorHandler);

if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT;
  app.listen(PORT, () => {
    console.error(`Server is running on http://localhost:${PORT}..`);
  });

  process.on("unhandledRejection", (reason) => {
    console.error("Unhandled promise rejection:", reason);
  });

  process.on("uncaughtException", (error) => {
    console.error("Uncaught exception:", error);
    process.exit(1);
  });
}

module.exports = app;
