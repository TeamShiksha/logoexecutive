import {rest} from 'msw';

export const contactUsHandler = [
	rest.post('/api/public/contact-us', (req, res, ctx) => {
		return res(
			ctx.status(200),
			ctx.json({
				message: 'Message sent successfully!',
			}),
		);
	}),
];
