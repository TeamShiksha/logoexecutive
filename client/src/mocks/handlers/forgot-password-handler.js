import {rest} from 'msw';

export const forgotPasswordHandler = [
	rest.post('/api/auth/forgot-password', (req, res, ctx) => {
		return res(
			ctx.status(200),
			ctx.json({message: 'Password reset link sent to your email'}),
		);
	}),
];
