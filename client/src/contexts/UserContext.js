import {createContext, useEffect, useState} from 'react';

export const UserContext = createContext();

export function UserProvider({children}) {
	const [userData, setUserData] = useState();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState();

	useEffect(() => {
		setLoading(true);
		fetch('/api/user/data')
			.then((res) => res.json())
			.then((data) => setUserData(data.data))
			.catch((err) => setError(err));
	}, []);

	return (
		<UserContext.Provider value={{userData, loading, error}}>
			{children}
		</UserContext.Provider>
	);
}
