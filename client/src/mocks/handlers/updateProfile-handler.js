import {rest} from 'msw';
import {STATUS_CODES} from 'http';

export const updateProfileHandler = [
	rest.patch('api/user/update-profile', (req, res, ctx) => {
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
	}),
];
