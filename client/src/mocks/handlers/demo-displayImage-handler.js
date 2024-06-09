import {rest} from 'msw';
const mockImagesData = {
	imageName: 'Google.png',
	data: 'http://localhost/google.png',
};
export const displayImagesHandler = [
	rest.get(
		`${process.env.REACT_APP_PROXY_URL}/api/public/logo`,
		(req, res, ctx) => {
			const domain = req.url.searchParams.get('domain');
			if (!domain) {
				return res(
					ctx.status(422),
					ctx.json({
						statusCode: 422,
						message: 'Domain is required',
					}),
				);
			}
			const image = mockImagesData['imageName'] === `${domain}.png`;
			if (!image) {
				return res(
					ctx.status(404),
					ctx.json({
						statusCode: 404,
						message: 'Logo not available',
					}),
				);
			}
			return res(
				ctx.status(200),
				ctx.json({
					statusCode: 200,
					data: mockImagesData['data'],
				}),
			);
		},
	),
];
