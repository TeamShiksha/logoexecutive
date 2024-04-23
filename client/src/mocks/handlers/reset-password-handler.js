import {rest} from 'msw';
import {STATUS_CODES} from 'http';

export const resetPasswordHandler = [
	rest.patch('/api/auth/reset-password', (req, res, ctx) => {
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

		if (newPassword === confirmPassword) {
			return res(
				ctx.status(200),
				ctx.json({
					message:
						'Your password has been successfully reset. You can now sign in with your new password.',
				}),
			);
		}
	}),
];
