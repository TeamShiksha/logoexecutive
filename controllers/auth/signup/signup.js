const Joi = require("joi");
const { emailRecordExists } = require("../../../services/Auth");
const { createUser } = require("../../../services/User");

const signupPayloadSchema = Joi.object().keys({
	name: Joi.string().trim().required().min(1).max(20),
	email: Joi.string().trim().required().max(50).regex(/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/),
	password: Joi.string().trim().required().min(8).max(30),
	confirmPassword: Joi.any().required().equal(Joi.ref("password")),
});

async function signupController(req, res) {
	const { body: payload } = req;

	const { error, value } = signupPayloadSchema.validate(payload);

	if (!!error) {
		return res.status(401).json({
			message: error.message,
			error: "Bad Request",
			status: 400,
		});
	}

	const { email } = value;

	const emailExists = await emailRecordExists(email);

	if (emailExists) {
		return res.status(400).json({
			message: "Email already exists",
			error: "Bad Request",
			status: 400,
		});
	}

	const result = await createUser(value);
	if (!result) {
		return res.status(401).json({
			message: "Unable to create user",
			error: "Bad Request",
			status: 400,
		});
	}

	return res.status(201).json({
		message: "Successfully created user",
		data: result.data,
	});
}

module.exports = signupController;
