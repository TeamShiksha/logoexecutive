const dotenv = require("dotenv");
const { validateEnv } = require("../utils/scripts/envSchema.js");
const serverless = require("serverless-http");

if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
} else {
  dotenv.config();
}
const { config } = require("../utils/constants.js");

const env = { ...process.env, ...config };

const { error } = validateEnv(env);

if (error) {
  console.log("\x1b[41m%s\x1b[0m", `Config validation error: ${error.message}`);
  process.exit(1);
}

const app = require("../app.js");

module.exports.handler = serverless(app);
