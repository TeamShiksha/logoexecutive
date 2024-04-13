import {useContext, useEffect, useState} from 'react';
import ApiKeyForm from '../../components/dashboard/ApiKeyForm';
import ApiKeyTable from '../../components/dashboard/ApiKeyTable';
import CurrentPlan from '../../components/dashboard/CurrentPlan';
import Usage from '../../components/dashboard/Usage';
import {isLettersAndSpacesOnly} from '../../constants';
import {UserContext} from '../../contexts/UserContext';
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
	const {userData} = useContext(UserContext);

	useEffect(() => {
		if (userData?.keys) {
			setKeys(userData.keys);
		}
	}, [userData]);

	const handleGenerateKey = (e) => {
		e.preventDefault();
		if (inputValue.trim() === '') {
			setErrorMessage('Description cannot be empty');
			return;
		}
		if (inputValue.trim().length > 20) {
			setErrorMessage('Description cannot be more than 20 characters');
			return;
		} else if (!isLettersAndSpacesOnly.test(inputValue)) {
			setErrorMessage('Description must contain only alphabets and spaces');
			return;
		}
		const newKey = {
			keyId:
				Math.random()
					.toString(RANDOM_STRING_LENGTH)
					.substring(2, RANDOM_STRING_LENGTH) +
				Math.random()
					.toString(RANDOM_STRING_LENGTH)
					.substring(2, RANDOM_STRING_LENGTH),
			keyDescription: inputValue,
			key:
				Math.random()
					.toString(RANDOM_STRING_LENGTH)
					.substring(2, RANDOM_STRING_LENGTH) +
				Math.random()
					.toString(RANDOM_STRING_LENGTH)
					.substring(2, RANDOM_STRING_LENGTH),
			usageCount: 0,
			createdAt: new Date().toLocaleDateString('en-US', {
				day: '2-digit',
				month: 'short',
				year: 'numeric',
			}),
			updatedAt: new Date().toLocaleDateString('en-US', {
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
					<CurrentPlan subscriptionData={userData?.subscription} />
					<Usage
						usedCalls={getUsedCalls(userData?.keys)}
						totalCalls={userData?.subscription.usageLimit || 0}
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
}

export default Dashboard;
