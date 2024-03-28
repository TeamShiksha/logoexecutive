import axios from 'axios';

export const instance = axios.create({});

export const protectedInstance = axios.create({
	withCredentials: true,
});
