import {rest} from 'msw';

export const updateProfileHandler = [
	rest.patch('api/user/update-profile', (req, res, ctx) => {
		return res(
			ctx.status(200),
			ctx.json({
				message: 'Profile Updated Successfully',
			}),
		);
	}),
];
