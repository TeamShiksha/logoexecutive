import {createContext, useState} from 'react';
import {protectedInstance} from '../api/api_instance';

export const UserContext = createContext();

export function UserProvider({children}) {
	const [userData, setUserData] = useState();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState();

	const fetchUserData = async () => {
		setLoading(true);
		try {
			const res = await protectedInstance.get('/api/user/data');
			const data = res.data.data;
			setUserData(data);
		} catch (err) {
			setError(err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<UserContext.Provider value={{userData, loading, error, fetchUserData}}>
			{children}
		</UserContext.Provider>
	);
}
