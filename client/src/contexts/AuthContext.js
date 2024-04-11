import {createContext, useEffect, useState} from 'react';
import {protectedInstance} from '../api/api_instance';

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isAuthCheckComplete, setAuthCheckComplete] = useState(false);

	useEffect(() => {
		const checkCookieExists = () => {
			const jwtCookie = document.cookie
				.split(';')
				.some((item) => item.trim().startsWith('jwt='));
			setIsAuthenticated(jwtCookie);
			setAuthCheckComplete(true);
		};

		checkCookieExists();
	}, []);

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
			{isAuthCheckComplete ? children : null}
		</AuthContext.Provider>
	);
};
