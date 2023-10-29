const dotenv = require("dotenv");
const fs = require("fs");
const { validateEnv } = require("./utils/scripts/envSchema");
const path = require("path");

if (process.env.NODE_ENV !== "production") {
	dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
} else {
	dotenv.config();
}

const serviceKeyPath = path.join(process.cwd(), "serviceAccountKey.json");
const serviceAccountKeyExists = fs.existsSync(serviceKeyPath);

const { error, value } = validateEnv(process.env, {
	serviceAccountKey: serviceAccountKeyExists,
});

if (error) {
	console.log("\x1b[41m%s\x1b[0m", `Config validation error: ${error.message}`);
	process.exit(1);
}

const app = require("./app");

const { PORT } = value;
app.listen(PORT, () => {
	console.log(`[Server] running 🚀: http://localhost:${PORT}`);
});

module.exports = app;
