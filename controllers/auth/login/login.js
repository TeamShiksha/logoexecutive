const Joi = require("joi");
const { fetchUserByUsername } = require("../../../services/User");

const loginPayloadSchema = Joi.object().keys({
  username: Joi.string()
    .required()
    .regex(/^[a-zA-Z0-9]$/)
    .message(
      "\"username\" can only contain alphanumeric letters and symbols _,-",
    ),
  password: Joi.string()
    .required()
    .regex(/^[a-zA-Z0-9$,@#-_]$/)
    .message(
      "password can only contain alphanumeric letters and symbols $,@#-_ ",
    ),
});

async function loginController(req, res) {
	const { body: payload } = req;

	const { error, value } = loginPayloadSchema.validate(payload);
	if (!!error) {
		return res
			.status(422)
			.json({ message: "Invalid payload", status: 422, error: error.message });
	}

	const { username, password } = value;

	const user = await fetchUserByUsername(username);
	if (!user) {
		return res.status(400).json({
			error: "Bad Request",
			message: "Username or Password incorrect",
			status: 400,
		});
	}

	const matchPassword = await user.matchPassword(password);
	if (!matchPassword) {
		return res.status(400).json({
			error: "Bad Request",
			message: "Username or Password incorrect",
			status: 400,
		});
	}

	return res
		.status(200)
		.json({
			message: "Login successful",
			data: { user: user.getUserData(), jwt: user.generateJWT() },
		});
}

module.exports = loginController;
