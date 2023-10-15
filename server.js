const dotenv = require("dotenv");
const app = require("./app");
const joi = require("joi");

dotenv.config();
const envSchema = joi
	.object()
	.keys({
		PORT: joi.number().positive().required(),
	})
	.unknown();

const { error, value } = envSchema.validate(process.env);
if (error) {
	throw new Error(`Config validation error: ${error.message}`);
}

const port = process.env.PORT;
app.listen({ port }, () => {
	console.log(`[Server] running 🚀: http://localhost:${port}`);
});

module.exports = app;
