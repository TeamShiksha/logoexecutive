import {rest} from 'msw';

const URL = 'http://localhost:3000';

const SingupHandler = [
    rest.post(`${URL}/api/auth/signup`, async (req, res, ctx) => {
        const body = await req.body();
        return res(
            ctx.status(200),
            ctx.json({
                success: true,
                data: body,
            })
        );
    }),
];
