import {rest} from 'msw';

export const signOutHandler = [
	rest.get(`${process.env.PROXY_URL}/api/auth/signout`, (req, res, ctx) => {
		return res(ctx.status(205));
	}),
];
