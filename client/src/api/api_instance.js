import axios from 'axios';

const baseURL = 'http://localhost:8888/api/';

// Basic axios instance for unauthenticated requests
export const instance = axios.create({
	baseURL,
});

// Axios instance with credentials for authenticated requests
export const protectedInstance = axios.create({
	baseURL,
	withCredentials: true,
});
