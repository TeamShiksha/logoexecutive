import {useContext, useEffect, useState} from 'react';
import ApiKeyForm from '../../components/dashboard/ApiKeyForm';
import ApiKeyTable from '../../components/dashboard/ApiKeyTable';
import ApiKey from '../../components/dashboard/ApiKey';
import CurrentPlan from '../../components/dashboard/CurrentPlan';
import Usage from '../../components/dashboard/Usage';
import {isLettersAndSpacesOnly} from '../../constants';
import {UserContext} from '../../contexts/UserContext';
import {useApi} from '../../hooks/useApi';
import './Dashboard.css';

function Dashboard() {
	const [inputValue, setInputValue] = useState('');
	const [deletedKey, setDeletedKey] = useState(null);
	const [errorMessage, setErrorMessage] = useState('');
	const [copiedKey, setCopiedKey] = useState(null);
	const [keys, setKeys] = useState([]);
	const [showKey, setShowKey] = useState(false);
	const {userData, fetchUserData} = useContext(UserContext);
	const {data, errorMsg, makeRequest, isSuccess, loading} = useApi({
		url: `api/user/generate`,
		method: 'post',
		data: {keyDescription: inputValue},
	});
	const {
		errorMsg: errorDeleteMsg,
		makeRequest: makeDeleteRequest,
		isSuccess: isDeleteSuccess,
	} = useApi({
		url: `api/user/destroy`,
		method: 'delete',
		params: {keyId: deletedKey},
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
			setShowKey(true);
			const newKey = {
				keyId: data.data.keyId,
				keyDescription: data.data.keyDescription,
				usageCount: data.data.usageCount,
				createdAt: data.data.createdAt,
				updatedAt: data.data.updatedAt,
			};
			setKeys([newKey, ...keys]);
			setInputValue('');
		} else if (errorMsg) {
			setErrorMessage(errorMsg);
			setInputValue('');
		}
	}, [isSuccess, errorMsg]);

	useEffect(() => {
		if (isDeleteSuccess) {
			const updatedKeys = keys.filter((key) => key.keyId !== deletedKey);
			setKeys(updatedKeys);
			setDeletedKey(null);
		}
		if (errorDeleteMsg) {
			setErrorMessage(errorDeleteMsg);
		}
	}, [errorDeleteMsg, isDeleteSuccess]);

	useEffect(() => {
		const deleteKeyFunction = async () => {
			await makeDeleteRequest();
		};
		if (deletedKey) {
			deleteKeyFunction();
		}
	}, [deletedKey]);

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
		await makeRequest();
	}

	const handleCopyToClipboard = async (apiKey) => {
		await navigator.clipboard.writeText(apiKey);
		setCopiedKey(apiKey);
	};

	const handleCloseKey = async (del) => {
		if (showKey) {
			const nv = await navigator.clipboard.readText();
			if (copiedKey !== nv && !del) {
				if (
					window.confirm(
						'Are you sure you want to close the API key? ( You have not copied the key )',
					)
				) {
					setShowKey(false);
				}
			} else {
				setShowKey(false);
			}
		}
	};

	return (
		<div className='dashboard-container' data-testid='testid-dashboard'>
			<div className='dashboard-content-container'>
				<section className='dashboard-content-section'>
					<CurrentPlan subscriptionData={userData?.subscription} />
					<Usage
						usedCalls={userData?.subscription.usageCount}
						totalCalls={userData?.subscription.usageLimit || 0}
					/>
					<div className='generate-api'>
						<h1 className='content-item-heading'>Generate your API key</h1>
						<ApiKeyForm
							inputValue={inputValue}
							setInputValue={setInputValue}
							errorMessage={errorMessage}
							loading={loading}
							setErrorMessage={setErrorMessage}
							handleGenerateKey={handleGenerateKey}
						/>
					</div>
				</section>
				{showKey && (
					<ApiKey
						Key={data?.data?.key}
						handleCloseKey={handleCloseKey}
						handleCopyToClipboard={handleCopyToClipboard}
					/>
				)}
				<div className='divider'></div>
				<ApiKeyTable
					keys={keys}
					copiedKey={copiedKey}
					handleCopyToClipboard={handleCopyToClipboard}
					deleteKey={setDeletedKey}
					handleCloseKey={handleCloseKey}
				/>
			</div>
		</div>
	);
}

export default Dashboard;
