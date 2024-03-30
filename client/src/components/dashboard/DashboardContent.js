import {useState} from 'react';
import ApiKeyForm from './ApiKeyForm';
import ApiKeyTable from './ApiKeyTable';
import CurrentPlan from './CurrentPlan';
import Usage from './Usage';
import {useApi} from '../../hooks/useApi';

const TOTAL_CALLS = 5000;
const USED_CALLS = 3000;
const RANDOM_STRING_LENGTH = 36;

function DashboardContent() {
	const [inputValue, setInputValue] = useState('');
	const [errorMessage, setErrorMessage] = useState('');
	const [copiedKey, setCopiedKey] = useState(null);
	const [keys, setKeys] = useState([]);

	const {data, makeRequest} = useApi(
		{
			url: 'api/user/generate',
			method: 'post',
			data: {
				keyDescription: inputValue,
				apiKey:
					Math.random()
						.toString(RANDOM_STRING_LENGTH)
						.substring(2, RANDOM_STRING_LENGTH) +
					Math.random()
						.toString(RANDOM_STRING_LENGTH)
						.substring(2, RANDOM_STRING_LENGTH),
				createDate: new Date().toLocaleDateString('en-US', {
					day: '2-digit',
					month: 'short',
					year: 'numeric',
				}),
			},
		},
		true,
	);
	
	const handleGenerateKey = async (e) => {
		e.preventDefault();
		if (inputValue.trim() === '') {
			setErrorMessage('Description cannot be empty');
			return;
		}

		try {
			const response = await makeRequest();
			if (response && data?.data) {
				setKeys([data.data, ...keys]);
				setErrorMessage('');
			} else {
				setErrorMessage(response?.message || 'An error occurred');
			}
		} catch (error) {
			setErrorMessage(
				error?.response?.data?.message || error?.message || 'An error occurred',
			);
		}
		setInputValue('');
	};
	const handleDeleteKey = (apiKey) => {
		setKeys(keys.filter((key) => key.apiKey !== apiKey));
	};
	const handleCopyToClipboard = async (apiKey) => {
		try {
			await navigator.clipboard.writeText(apiKey);
			setCopiedKey(apiKey);
		} catch (err) {
			console.error('Failed to copy text: ', err);
		}
	};

	return (
		<div className='dashboard-content-container'>
			<section className='dashboard-content-section'>
				<CurrentPlan />
				<Usage usedCalls={USED_CALLS} totalCalls={TOTAL_CALLS} />
				<div className='generate-api'>
					<h1 className='content-item-heading'>Generate your API key</h1>
					<ApiKeyForm
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
	);
}

export default DashboardContent;
