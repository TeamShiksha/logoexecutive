import {useEffect, useState} from 'react';
import ApiKeyForm from './ApiKeyForm';
import ApiKeyTable from './ApiKeyTable';
import CurrentPlan from '../CurrentPlan/CurrentPlan';
import Usage from './Usage';

const TOTAL_CALLS = 5000;
const USED_CALLS = 3000;

const DashboardContent = () => {
	const [inputValue, setInputValue] = useState('');
	const [errorMessage, setErrorMessage] = useState('');
	const [copiedKey, setCopiedKey] = useState(null);
	const [keys, setKeys] = useState([]);

	const [data, setData] = useState();

	useEffect(() => {
		let ignore = false;

		if (!ignore) {
			fetch('/api/user/data')
				.then((res) => res.json())
				.then((data) => setData(data.data));
		}

		return () => {
			ignore = true;
		};
	}, []);

	const handleGenerateKey = (e) => {
		e.preventDefault();

		const value = e.target.value;

		if (!value) {
			setErrorMessage('Description cannot be empty');
			return;
		}

		const newKey = {keyDescription: inputValue};

		setKeys([newKey, ...keys]);
		setInputValue('');
		setErrorMessage('');
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
				<CurrentPlan
					subscriptionType={data?.subscriptionType}
					isActive={data?.isActive}
				/>
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
};

export default DashboardContent;
