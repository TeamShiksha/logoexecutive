import {rest} from 'msw';

export const contactUsHandler = [
	rest.post(
		`${process.env.REACT_APP_PROXY_URL}/api/public/contact-us`,
		(req, res, ctx) => {
			return res(
				ctx.status(200),
				ctx.json({
					message: 'Message sent successfully!',
				}),
			);
		},
	),
];
