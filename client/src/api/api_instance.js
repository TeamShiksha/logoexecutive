import axios from 'axios';

export const instance = axios.create({
	headers: {
		'Content-Type': 'application/json',
	},
});

export const protectedInstance = axios.create({
	withCredentials: true,
});
