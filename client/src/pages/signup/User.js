import React, {useEffect, useState} from 'react';
import axios from 'axios';

const User = () => {
	const [user, setUser] = useState(null);

	useEffect(() => {
		const fetchUser = async () => {
			const response = await axios.get('/api/user');
			setUser(response.data);
		};

		fetchUser();
	}, []);

	if (!user) {
		return <div>Loading...</div>;
	}

	return (
		<div>
			<h1>{user.name}</h1>
			<p>{user.email}</p>
		</div>
	);
};

export default User;
