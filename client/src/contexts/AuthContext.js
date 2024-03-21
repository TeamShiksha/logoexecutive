import {createContext, useState} from 'react';
import {protectedInstance} from '../api/api_instance';

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	const logout = async () => {
		try {
			await protectedInstance.get(`api/auth/signout`);
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
