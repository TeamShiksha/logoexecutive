import {rest} from 'msw';

export const handlers = [
	rest.get('/api/user', (req, res, ctx) => {
		return res(
			ctx.json({
				name: 'John Doe',
				email: 'john.doe@example.com',
			}),
		);
	}),
];
