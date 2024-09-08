import { rest } from "msw";

const mockQueries = [
  {
    _id: '66bf3695a4e3b9dab1d6f8e9',
    email: 'ayushsanjpro7@gmail.com',
    name: 'Ayush seven',
    message: 'Give me some logos.....',
    activityStatus: false,
    assignedTo: null,
    createdAt: '2024-08-16T11:23:01.684Z',
    updatedAt: '2024-08-16T11:23:01.684Z',
    __v: 0,
  },
  {
    _id: '66bf3695a4e3b9dab1d6f8e7',
    email: 'ayushsanjpro9@gmail.com',
    name: 'Ayush seven',
    message: 'I need few logos for my company',
    activityStatus: true,
    assignedTo: '66ba2bc6cff9dbf40b729063',
    createdAt: '2024-08-16T11:23:01.684Z',
    updatedAt: '2024-08-16T11:23:01.684Z',
    reply: 'Here are the logos',
    __v: 0,
  },
];

export const queriesHandler = [
  rest.get('/api/common/pagination', (req, res, ctx) => {
    return res(ctx.json(mockQueries));
  }),
];