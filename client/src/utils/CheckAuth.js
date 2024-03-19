import {useContext, useEffect} from 'react';
import {AuthContext} from '../contexts/AuthContext';

const CheckAuth = () => {
	const {setIsAuthenticated} = useContext(AuthContext);

	useEffect(() => {
		const checkCookieExists = () => {
			const jwtCookie = document.cookie
				.split(';')
				.some((item) => item.trim().startsWith('jwt='));
			if (jwtCookie) {
				setIsAuthenticated(true);
			} else {
				setIsAuthenticated(false);
			}
		};

		checkCookieExists();
	}, [setIsAuthenticated]);

	return null;
};

export default CheckAuth;
