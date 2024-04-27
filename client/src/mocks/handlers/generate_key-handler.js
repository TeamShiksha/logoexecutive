import {rest} from 'msw';

export const generateKeyHandler = [
	rest.post('api/user/generate', (req, res, ctx) => {
		return res(
			ctx.status(200),
			ctx.json({
                "message": "Key generated successfully",
                "statusCode": 200,
                "data": {
                    "keyId": "d0cdc208-ecb6-4161-9c00-a5f5db66cfab",
                    "keyDescription": "Test API Key",
                    "key": "7D8ED2F3F2C748BC9B96CED7EE2DE1BF",
                    "usageCount": 0,
                    "createdAt": new Date().toLocaleDateString('en-US', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                    }),
                    "updatedAt": new Date().toLocaleDateString('en-US', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                    })
                }
            }),
		);
	}),
];