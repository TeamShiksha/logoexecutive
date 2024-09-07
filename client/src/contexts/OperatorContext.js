import {createContext, useState} from 'react';
import {instance} from '../api/api_instance';

export const OperatorContext = createContext();

export function OperatorProvider({children}) {
	const [queries, setQueries] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState();

	const fetchQueries = async (isActive, currentPage, queriesPerPage) => {
		setLoading(true);
		try {
			const res = await instance.get('/api/common/pagination', {
				params: {
					model: 'ContactUs',
					page: currentPage,
					limit: queriesPerPage,
					active: isActive,
				},
			});
			const data = res.data;
			setQueries(data);
		} catch (err) {
			setError(err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<OperatorContext.Provider value={{queries, loading, error, fetchQueries}}>
			{children}
		</OperatorContext.Provider>
	);
}
