import {rest} from 'msw';
import {STATUS_CODES} from 'http';

export const emailVerificationHandler = [
	rest.get('/api/auth/verify?token=exampleToken', (req, res, ctx) => {
		return res(
			ctx.status(200),
			ctx.json({
				message: 'Verification successful',
				statusCode: 200,
				error: STATUS_CODES[200],
			}),
		);
	}),
	rest.get('/api/auth/verify?token=malformedToken', (req, res, ctx) => {
		return res(
			ctx.status(403),
			ctx.json({
				message: 'Token Expired',
				statusCode: 403,
				error: STATUS_CODES[403],
			}),
		);
	}),
];
