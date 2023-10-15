const dotenv = require("dotenv");

if (process.env.NODE_ENV !== "production") {
	dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
} else {
	dotenv.config();
}

const app = require("./app");
const joi = require("joi");


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
