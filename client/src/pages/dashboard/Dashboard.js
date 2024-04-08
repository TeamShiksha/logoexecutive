import {useEffect, useState} from 'react';
import ApiKeyForm from '../../components/dashboard/ApiKeyForm';
import ApiKeyTable from '../../components/dashboard/ApiKeyTable';
import CurrentPlan from '../../components/dashboard/CurrentPlan';
import Usage from '../../components/dashboard/Usage';
import './Dashboard.css';

const RANDOM_STRING_LENGTH = 36;

function getUsedCalls(keys) {
	let result = 0;
	if (!keys) return result;
	keys.forEach((key) => {
		result += key.usageCount;
	});
	return result;
}

function Dashboard() {
	const [inputValue, setInputValue] = useState('');
	const [errorMessage, setErrorMessage] = useState('');
	const [copiedKey, setCopiedKey] = useState(null);
	const [keys, setKeys] = useState([]);
	const [dashboardData, setDashboardData] = useState();

	useEffect(() => {
		if (dashboardData?.keys) {
			setKeys(dashboardData.keys);
		}
	}, [dashboardData]);

	useEffect(() => {
		fetch('/api/user/data')
			.then((res) => res.json())
			.then((data) => {
				setDashboardData(data.data);
			});
	}, []);

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
					<CurrentPlan subscriptionData={dashboardData?.subscription} />
					<Usage
						usedCalls={getUsedCalls(dashboardData?.keys)}
						totalCalls={dashboardData?.subscription.usageLimit || 0}
					/>
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

export default Dashboard;
