import {rest} from 'msw';

const imageUploadHandler = [
	rest.post('/api/admin/upload', (req, res, ctx) => {
		return res(
			ctx.status(200),
			ctx.json({
				message: 'Image Uploaded successfully',
			}),
		);
	}),
];

export default imageUploadHandler;
