import {rest} from 'msw';
const {STATUS_CODES} = require('http');

export const destroyKeyHandler = [
	rest.delete(
		`${process.env.REACT_APP_PROXY_URL}/api/user/destroy`,
		(req, res, ctx) => {
			const keyId = req.url.searchParams.get('keyId');
			if (keyId === '4d6544e38f5d4ad8bae546ea61e2b842') {
				return res(
					ctx.status(200),
					ctx.json({
						message: 'Key deleted successfully',
						statusCode: STATUS_CODES[200],
					}),
				);
			} else {
				return res(
					ctx.status(422),
					ctx.json({
						message: 'Key ID is required',
						statusCode: STATUS_CODES[422],
						error: STATUS_CODES[422],
					}),
				);
			}
		},
	),
];
