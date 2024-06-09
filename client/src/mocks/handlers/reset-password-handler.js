import {rest, HttpResponse} from 'msw';
import {STATUS_CODES} from 'http';

export const resetPasswordHandler = [
	rest.patch(
		`${process.env.REACT_APP_PROXY_URL}/api/auth/reset-password`,
		(req, res, ctx) => {
			const {newPassword, confirmPassword} = req.body;

			if (newPassword !== confirmPassword) {
				return res(
					ctx.status(422),
					ctx.json({
						message: 'Password and confirm password do not match',
						statusCode: 422,
						error: STATUS_CODES[422],
					}),
				);
			}

			if (newPassword === '123456789') {
				return res(
					ctx.status(200),
					ctx.json({
						message:
							'Your password has been successfully reset. You can now sign in with your new password.',
					}),
				);
			}
			if (newPassword === 'password@123') {
				return res(
					ctx.status(500),
					ctx.json({
						message: 'Internal Server Error',
						statusCode: 500,
						error: STATUS_CODES[500],
					}),
				);
			}
			if (newPassword === 'network@123') {
				return HttpResponse.error();
			}
		},
	),
];
