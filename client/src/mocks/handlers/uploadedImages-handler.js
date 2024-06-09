import {rest} from 'msw';
const mockUploadedImagesData = [
	{
		domainame: 'Google.png',
		createdAt: '2023-05-23T07:23:21.816Z',
		updatedAt: '2023-05-23T07:23:21.816Z',
	},
	{
		domainame: 'Meta.png',
		createdAt: '2023-05-22T07:23:21.816Z',
		updatedAt: '2023-05-22T07:23:21.816Z',
	},
];

export const uploadedImagesHandler = [
	rest.get(
		`${process.env.REACT_APP_PROXY_URL}/api/admin/images`,
		(req, res, ctx) => {
			return res(
				ctx.status(200),
				ctx.json({
					data: mockUploadedImagesData,
				}),
			);
		},
	),
];
