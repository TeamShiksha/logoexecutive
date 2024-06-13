import {rest} from 'msw';

export const signOutHandler = [
	rest.get('/api/auth/signout', (req, res, ctx) => {
		return res(ctx.status(205));
	}),
];
