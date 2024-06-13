import {rest} from 'msw';

const userDeleteHandler = [
	rest.delete('/api/user/delete', (req, res, ctx) => {
		return res(
			ctx.status(200),
			ctx.json({
				message: 'Your user data has been successfully deleted from our system',
			}),
		);
	}),
];

export default userDeleteHandler;
