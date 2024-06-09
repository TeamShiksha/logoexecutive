import {rest} from 'msw';
import {formatDate} from '../../utils/helpers';

var keyDescriptionMap = new Map();
export const generateKeyHandler = [
	rest.post(
		`${process.env.REACT_APP_PROXY_URL}/api/user/generate`,
		(req, res, ctx) => {
			const {keyDescription} = req.body;
			if (!keyDescriptionMap.has(keyDescription)) {
				keyDescriptionMap.set(keyDescription, 1);
				return res(
					ctx.status(200),
					ctx.json({
						message: 'Key generated successfully',
						statusCode: 200,
						data: {
							keyId: 'd0cdc208-ecb6-4161-9c00-a5f5db66cfab',
							keyDescription: 'Test API Key',
							key: '7D8ED2F3F2C748BC9B96CED7EE2DE1BF',
							usageCount: 0,
							createdAt: formatDate(),
							updatedAt: formatDate(),
						},
					}),
				);
			} else if (keyDescriptionMap.get(keyDescription) === 1) {
				keyDescriptionMap.set(keyDescription, 2);
				return res(
					ctx.status(409),
					ctx.json({
						message: 'Please provide a different key description',
						statusCode: 409,
						error: 'Conflict',
					}),
				);
			} else {
				return res(
					ctx.status(403),
					ctx.json({
						message: 'Limit reached. Consider upgrading your plan',
						statusCode: 403,
						error: 'Forbidden',
					}),
				);
			}
		},
	),
];
