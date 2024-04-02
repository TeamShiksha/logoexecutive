import {useState} from 'react';
import ApiKeyForm from '../../components/dashboard/ApiKeyForm';
import ApiKeyTable from '../../components/dashboard/ApiKeyTable';
import CurrentPlan from '../../components/dashboard/CurrentPlan';
import Usage from '../../components/dashboard/Usage';
import './Dashboard.css';

const TOTAL_CALLS = 5000;
const USED_CALLS = 3000;
const RANDOM_STRING_LENGTH = 36;

export const Dashboard = () => {
	const [inputValue, setInputValue] = useState('');
	const [errorMessage, setErrorMessage] = useState('');
	const [copiedKey, setCopiedKey] = useState(null);
	const [keys, setKeys] = useState([
		{
			description: 'Demo Key 1',
			apiKey: 'maohquwnbtpszjqj91myxk',
			createDate: 'Dec 18, 2023',
		},
		{
			description: 'Demo Key 2',
			apiKey: 'txoediu8lvq01vzdpz38hldc',
			createDate: 'Sep 07, 2023',
		},
	]);

	const handleGenerateKey = (e) => {
		e.preventDefault();
		if (inputValue.trim() === '') {
			setErrorMessage('Description cannot be empty');
			return;
		}
		const newKey = {
			description: inputValue,
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
		};
		setKeys([newKey, ...keys]);
		setInputValue('');
		setErrorMessage('');
	};
	const handleDeleteKey = (apiKey) => {
		setKeys(keys.filter((key) => key.apiKey !== apiKey));
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
