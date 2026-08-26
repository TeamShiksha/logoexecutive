const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const Tokens = require("csrf");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./utils/swagger");
const { validateEnv } = require("./utils/envSchema");
const routes = require("./routes/index");

/**
 * Load environmental variables only if `NODE_ENV` is not "test"
 */
if (process.env.NODE_ENV !== "test") {
  dotenv.config();
  const { error } = validateEnv(process.env);
  if (error) {
    console.log(`Config validation error: ${error.message}`);
    process.exit(1);
  }
  mongoose
    .connect(process.env.MONGO_URL)
    .then(() => console.info("Connected to mongodb.."))
    .catch((err) => {
      console.error("Mongodb connection error:", err.message);
      process.exit(1);
    });
}

const app = express();
app.use(cookieParser());
app.disable("x-powered-by");
app.use(express.json());

const tokens = new Tokens();
app.use((req, res, next) => {
  if (process.env.NODE_ENV === "test") return next();
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  const secret = req.cookies["_csrfs"] || tokens.secretSync();
  const clientToken = req.headers["x-csrf-token"];
  if (!clientToken || !tokens.verify(secret, clientToken)) {
    return res.status(403).json({ statusCode: 403, message: "Invalid CSRF token" });
  }
  next();
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/", routes);

if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT;
  app.listen(PORT, () => {
    console.error(`Server is running on http://localhost:${PORT}..`);
  });
}

module.exports = app;
