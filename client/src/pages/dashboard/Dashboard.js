import {useContext, useEffect, useState} from 'react';
import ApiKeyForm from '../../components/dashboard/ApiKeyForm';
import ApiKeyTable from '../../components/dashboard/ApiKeyTable';
import CurrentPlan from '../../components/dashboard/CurrentPlan';
import Usage from '../../components/dashboard/Usage';
import {isLettersAndSpacesOnly} from '../../constants';
import {UserContext} from '../../contexts/UserContext';
import './Dashboard.css';
import {useApi} from '../../hooks/useApi';

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
	const {userData, fetchUserData} = useContext(UserContext);
	const {data, errorMsg, makeRequest, isSuccess} = useApi({
		url: `api/user/generate`,
		method: 'post',
		data: {keyDescription: inputValue},
	});

	useEffect(() => {
		fetchUserData();
	}, []);

	useEffect(() => {
		if (userData?.keys) {
			setKeys(userData.keys);
		}
	}, [userData]);

	useEffect(() => {
		if (isSuccess) {
			const newKey = {
				keyId: data.data.keyId,
				keyDescription: inputValue,
				key: data.data.key,
				usageCount: data.data.usageCount,
				createdAt: data.data.createdAt,
				updatedAt: data.data.updatedAt,
			};
			setKeys([newKey, ...keys]);
			setErrorMessage('');
		}
		setInputValue('');
	}, [isSuccess]);

	async function handleGenerateKey(e) {
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
		const success = await makeRequest();
		if (!success) {
			setErrorMessage(errorMsg);
		}
	}

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
