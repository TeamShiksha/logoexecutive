import axios from 'axios';

const PROXY_URL = process.env.REACT_APP_PROXY_URL;
export const instance = axios.create({
	baseURL: PROXY_URL,
	headers: {
		'Content-Type': 'application/json',
	},
});

export const protectedInstance = axios.create({
	baseURL: PROXY_URL,
	withCredentials: true,
});
