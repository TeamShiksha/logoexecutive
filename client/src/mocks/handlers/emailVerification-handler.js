import {rest} from 'msw';
import {STATUS_CODES} from 'http';

export const emailVerificationHandler = [
	rest.get(
		`${process.env.REACT_APP_PROXY_URL}/api/auth/verify`,
		(req, res, ctx) => {
			const {searchParams} = req.url;
			const token = searchParams.get('token');
			if (token === 'exampleToken') {
				return res(
					ctx.status(200),
					ctx.json({
						message: 'Verification successful',
						statusCode: 200,
						error: STATUS_CODES[200],
					}),
				);
			} else {
				return res(
					ctx.status(403),
					ctx.json({
						message: 'Token Expired',
						statusCode: 403,
						error: STATUS_CODES[403],
					}),
				);
			}
		},
	),
];
