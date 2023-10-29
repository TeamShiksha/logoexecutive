const Joi = require("joi");
const { fetchUserByEmail } = require("../../../services/User");

const loginPayloadSchema = Joi.object().keys({
	email: Joi.string().required(),
	password: Joi.string().required()
});

async function loginController(req, res) {
	try {
		const { body: payload } = req;

		const { error, value } = loginPayloadSchema.validate(payload);
		if (!!error) {
			return res
				.status(422)
				.json({ message: "Invalid payload", status: 422, error: error.message });
		}

		const { email, password } = value;

		const user = await fetchUserByEmail(email);
		if (!user) {
			return res.status(400).json({
				error: "Bad Request",
				message: "Email or Password incorrect",
				status: 400,
			});
		}

		const matchPassword = await user.matchPassword(password);
		if (!matchPassword) {
			return res.status(400).json({
				error: "Bad Request",
				message: "Email or Password incorrect",
				status: 400,
			});
		}

		return res.status(200).json({
			user: user.data,
			token: user.generateJWT,
			expires_in: 24 * 60 * 60
		});

	} catch (err) {
		console.log(err);
		throw err;
	}
}

module.exports = loginController;
