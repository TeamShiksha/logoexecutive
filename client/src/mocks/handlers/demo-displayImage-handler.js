import {rest} from 'msw';
const mockImagesData = [{domain: 'Google.png'}, {domain: 'Meta.png'}];
export const displayImagesHandler = [
	rest.get('api/public/logo', (req, res, ctx) => {
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
		const image = mockImagesData.find((img) => img.domain === `${domain}.png`);
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
				data: image,
			}),
		);
	}),
];
