import {rest} from 'msw';
import {STATUS_CODES} from 'http';

export const signinHandler = [
	rest.post(
		`${process.env.REACT_APP_PROXY_URL}/api/auth/signin`,
		(req, res, ctx) => {
			const {email, password} = req.body;

			if (email === 'unverified@gmail.com') {
				return res(
					ctx.status(401),
					ctx.json({
						message: 'Email not verified',
						statusCode: 401,
						error: STATUS_CODES[401],
					}),
				);
			}

			if (password !== 'p@$$W0rD') {
				return res(
					ctx.status(401),
					ctx.json({
						message: 'Incorrect email or password.',
						statusCode: 401,
						error: STATUS_CODES[401],
					}),
				);
			}

			return res(
				ctx.status(200),
				ctx.json({
					message: 'Sign-in successful',
				}),
			);
		},
	),
];
