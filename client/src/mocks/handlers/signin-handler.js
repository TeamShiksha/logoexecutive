import {rest} from 'msw';

export const signinHandler = [
	rest.post('/api/auth/signin', (req, res, ctx) => {
		const {email, password} = req.body;

		if (email === 'unverified@gmail.com') {
			return res(
				ctx.status(401),
				ctx.json({
					message: 'Email not verified',
					statusCode: 401,
					error: 'Unauthorized',
				}),
			);
		}

		if (password !== 'p@$$W0rD') {
			return res(
				ctx.status(401),
				ctx.json({
					message: 'Incorrect email or password.',
					statusCode: 401,
					error: 'Unauthorized',
				}),
			);
		}

		return res(
			ctx.status(200),
			ctx.json({
				message: 'Sign-in successful',
			}),
		);
	}),
];
