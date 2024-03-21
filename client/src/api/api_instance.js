import axios from 'axios';

// Basic axios instance for unauthenticated requests
export const instance = axios.create({});

// Axios instance with credentials for authenticated requests
export const protectedInstance = axios.create({
	withCredentials: true,
});
