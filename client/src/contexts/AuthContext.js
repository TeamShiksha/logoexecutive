import axios from 'axios';
import {createContext, useState} from 'react';

const BASE_API_URL = process.env.REACT_APP_BASE_API_URL;

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	const logout = async () => {
		try {
			await axios.get(`${BASE_API_URL}/auth/signout`, {withCredentials: true});
			setIsAuthenticated(false);
		} catch (err) {
			console.error(err);
		}
	};

	return (
		<AuthContext.Provider value={{isAuthenticated, setIsAuthenticated, logout}}>
			{children}
		</AuthContext.Provider>
	);
};
