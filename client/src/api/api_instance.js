import axios from 'axios';

const baseURL = 'http://localhost:8888/api/';

export const instance = axios.create({
	baseURL,
});

export const protectedInstance = axios.create({
	baseURL,
	withCredentials: true,
});
