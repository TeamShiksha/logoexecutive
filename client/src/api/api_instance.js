import axios from 'axios';

// Basic axios instance for unauthenticated requests
export const instance = axios.create({
	headers: {
		'Content-Type': 'application/json',
	},
});

export const protectedInstance = axios.create({
	withCredentials: true,
});
