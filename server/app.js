const express = require("express");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const { validateEnv } = require("./utils/scripts/envSchema.js");

dotenv.config();
const { error } = validateEnv(process.env);
if (error) {
  console.log(`Config validation error: ${error.message}`);
  process.exit(1);
}

const routes = require("./routes");
const { routeNotFound, errorHandler } = require("./middlewares");

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use("/api/", routes);
app.use(routeNotFound);
app.use(errorHandler);

app.listen(process.env.PORT,()=>{console.log(`Server listening at port ${process.env.PORT}`);});

module.exports = app;
