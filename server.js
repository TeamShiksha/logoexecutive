const dotenv = require("dotenv");

const app = require("./app");

const joi = require("joi");

if (process.env.NODE_ENV) {
	dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
} else {
	dotenv.config();
}

const envSchema = joi
	.object()
	.keys({
		NODE_ENV: joi
			.string()
			.valid("production", "development")
			.required(),
		PORT: joi.number().positive().required(),
	})
	.unknown();

const { error, value } = envSchema.validate(process.env);

if (error) {
	throw new Error(`Config validation error: ${error.message}`);
}

const port = process.env.PORT;

app.listen({ port }, () => {
	console.log(`[Server] ready 🚀: http://localhost:${port}`);
});

module.exports = app;
