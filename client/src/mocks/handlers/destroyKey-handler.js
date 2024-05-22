import {rest} from 'msw';

export const destroyKeyHandler = [
	rest.delete('api/user/destroy', (req, res, ctx) => {
		return res(
			ctx.status(200),
			ctx.json({
				message: 'Key deleted successfully',
				statusCode: 200,
			}),
		);
	}),
];
