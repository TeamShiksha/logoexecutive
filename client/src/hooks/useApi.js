import {useState} from 'react';
import {instance, protectedInstance} from '../api/api_instance';

/**
 * Custom React hook to make API requests using axios.
 *
 * @param {Object} config - The axios request configuration.
 * @param {boolean} isProtected - If true, the request will be made with credentials.
 *
 * @returns {Object} - Contains the response data, a function to set the data, the error message if any, the loading state, and a function to make the request.
 */

export const useApi = (config, isProtected = false) => {
	const [data, setData] = useState(null);
	const [errorMsg, setErrorMsg] = useState('');
	const [isSuccess, setIsSuccess] = useState(false);
	const [loading, setLoading] = useState(false);

	const makeRequest = async () => {
		setErrorMsg(null);
		setIsSuccess(false);
		setLoading(true);
		let success = false;
		try {
			const axiosInstance = isProtected ? protectedInstance : instance;
			const response = await axiosInstance(config);
			setData(response.data);
			setIsSuccess(true);
			success = true;
		} catch (err) {
			console.error(err);
			setIsSuccess(false);
			if (err?.response?.data?.message) {
				setErrorMsg(err?.response?.data?.message);
			} else {
				setErrorMsg(err?.message);
			}
		} finally {
			setLoading(false);
		}
		return success;
	};
	return {
		data,
		setData,
		errorMsg,
		loading,
		setLoading,
		makeRequest,
		isSuccess,
		setIsSuccess,
		setErrorMsg,
	};
};
