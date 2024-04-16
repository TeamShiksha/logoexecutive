import {rest} from 'msw';

export const signupHandler = [
	rest.post('api/auth/signup', (req, res, ctx) => {
		return res(
			ctx.status(200),
			ctx.json({
				message: 'User created successfully. Verification email sent.',
			}),
		);
	}),
];
