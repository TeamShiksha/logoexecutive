import {useState, useEffect} from 'react';
import ApiKeyForm from '../../components/dashboard/ApiKeyForm';
import ApiKeyTable from '../../components/dashboard/ApiKeyTable';
import CurrentPlan from '../../components/dashboard/CurrentPlan';
import Usage from '../../components/dashboard/Usage';
import './Dashboard.css';
import {useApi} from '../../hooks/useApi';

const TOTAL_CALLS = 5000;
const USED_CALLS = 3000;
// const RANDOM_STRING_LENGTH = 36;

export const Dashboard = () => {
	const [inputValue, setInputValue] = useState('');
	const [errorMessage, setErrorMessage] = useState('');
	const [copiedKey, setCopiedKey] = useState(null);
	const [keys, setKeys] = useState([]);
	const [requestCompleted, setRequestCompleted] = useState(false);

	const {data, makeRequest, errorMsg, loading} = useApi(
		{
			url: 'api/user/generate',
			method: 'post',
			data: {
				keyDescription: inputValue,
			},
		},
		true,
	);

	useEffect(() => {
		if (requestCompleted && data?.data) {
			setKeys((prevKeys) => [{...data.data}, ...prevKeys]);
			setErrorMessage('');
			setRequestCompleted(false);
		} else {
			setErrorMessage(errorMsg);
			setRequestCompleted(false);
		}
	}, [requestCompleted, data, errorMsg]);

	const validateForm = () => {
		if (inputValue.trim() === '') {
			setErrorMessage('Key Description cannot be empty');
			return false;
		}

		if (inputValue.length > 12) {
			setErrorMessage('Key Description cannot be more than 12 characters');
			return false;
		}

		if (inputValue.match(/^[a-zA-Z\s]+$/u) === null) {
			setErrorMessage('Key Description must contain only alphabets');
			return false;
		}
		return true;
	};

	const handleGenerateKey = async (e) => {
		e.preventDefault();
		if (!validateForm()) return;
		try {
			await makeRequest();
			setRequestCompleted(true);
		} catch (error) {
			setErrorMessage(errorMsg || error?.message);
		}
		setInputValue('');
	};

	const handleDeleteKey = (apiKey) => {
		setKeys(keys.filter((key) => key.key !== apiKey));
	};

	const handleCopyToClipboard = async (apiKey) => {
		await navigator.clipboard.writeText(apiKey);
		setCopiedKey(apiKey);
	};

	return (
		<div className='dashboard-container' data-testid='testid-dashboard'>
			<div className='dashboard-content-container'>
				<section className='dashboard-content-section'>
					<CurrentPlan />
					<Usage usedCalls={USED_CALLS} totalCalls={TOTAL_CALLS} />
					<div className='generate-api'>
						<h1 className='content-item-heading'>Generate your API key</h1>
						<ApiKeyForm
							loading={loading}
							inputValue={inputValue}
							setInputValue={setInputValue}
							errorMessage={errorMessage}
							setErrorMessage={setErrorMessage}
							handleGenerateKey={handleGenerateKey}
						/>
					</div>
				</section>
				<div className='divider'></div>
				<ApiKeyTable
					keys={keys}
					copiedKey={copiedKey}
					handleCopyToClipboard={handleCopyToClipboard}
					deleteKey={handleDeleteKey}
				/>
			</div>
		</div>
	);
};
