import {rest} from 'msw';

const userDeleteHandler = [
	rest.delete(
		`${process.env.REACT_APP_PROXY_URL}/api/user/delete`,
		(req, res, ctx) => {
			return res(
				ctx.status(200),
				ctx.json({
					message:
						'Your user data has been successfully deleted from our system',
				}),
			);
		},
	),
];

export default userDeleteHandler;
