import {rest} from 'msw';
import {STATUS_CODES} from 'http';

export const updateProfileHandler = [
	rest.patch(
		`${process.env.REACT_APP_PROXY_URL}/api/user/update-profile`,
		(req, res, ctx) => {
			const {firstName} = req.body;

			if (firstName === 'abc123') {
				return res(
					ctx.status(422),
					ctx.json({
						message: 'First name should only contain alphabets',
						statusCode: 422,
						error: STATUS_CODES[422],
					}),
				);
			}

			return res(
				ctx.status(200),
				ctx.json({
					message: 'Profile Updated Successfully',
				}),
			);
		},
	),
	rest.post(
		`${process.env.REACT_APP_PROXY_URL}/api/user/update-password`,
		(req, res, ctx) => {
			const {currPassword} = req.body;
			if (currPassword === 'invalidPass@123') {
				return res(
					ctx.status(400),
					ctx.json({
						message: 'Current password is incorrect',
						statusCode: 400,
						error: STATUS_CODES[400],
					}),
				);
			}
			return res(
				ctx.status(200),
				ctx.json({
					message: 'Password Updated Successfully',
				}),
			);
		},
	),
];
