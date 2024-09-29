import {rest} from 'msw';

const mockQueries = [
	{
		_id: '66bf3695a4e3b9dab1d6f8e9',
		message: 'Give me some logos.....',
		activityStatus: false,
		createdAt: '2024-08-16T11:23:01.684Z',
		updatedAt: '2024-08-16T11:23:01.684Z',
	},
	{
		_id: '66bf3695a4e3b9dab1d6f8e7',
		message: 'I need few logos for my company',
		activityStatus: true,
		createdAt: '2024-08-16T11:23:01.684Z',
		updatedAt: '2024-08-16T11:23:01.684Z',
		reply: 'Here are the logos',
	},
];

export const queriesHandler = [
	rest.get('/api/common/pagination', (req, res, ctx) => {
		return res(ctx.json(mockQueries));
	}),
];
