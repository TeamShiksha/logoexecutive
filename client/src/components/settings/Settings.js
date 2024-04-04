import {useState} from 'react';
import Modal from '../common/modal/Modal';
import './Settings.css';
import {useApi} from '../../hooks/useApi';
import {useNavigate} from 'react-router-dom';

/**  questions
 * 1. Close dialog on delete
 * 2. To remove cookies from BE or FE?
 * 3. To remove all localStorage?
 * 4. To remove UserTokens?
 * 5. To redirect?? Change get started to logout??
 * 6. Check tests for Dashboard
 * 7. Where to provide success message for deleted profile and updated profile
 */

function Settings() {
	const [modalOpen, setModalOpen] = useState(false);
	const navigate = useNavigate();
	const {makeRequest, error} = useApi({
		url: 'api/user/delete',
		method: 'delete',
	});

	if (error) return;

	const openModal = () => setModalOpen(true);

	const handleConfirm = async () => {
		try {
			const success = await makeRequest();
			if (success) {
				localStorage.clear();
				navigate('/');
			}
		} catch (error) {
			console.error('Failed to delete account: ', error);
		}
	};

	return (
		<section className='settings' data-testid='testid-settings'>
			<h1 className='sett-cont-heading'>Settings</h1>
			<button className='settings-button'>Download Account Data</button>
			<p className='setting-instruction'>
				This will prepare a PDF download of your personal data.
			</p>
			<button onClick={openModal} className='settings-button settings-delete'>
				Delete Account
			</button>
			<p className='setting-instruction'>
				This will permanently delete your account and all associated data.
			</p>
			<Modal
				modalOpen={modalOpen}
				setModal={setModalOpen}
				showButtons={true}
				handleConfirm={handleConfirm}
			>
				<h2>Are you sure?</h2>
				<p className='settings-confirm-message'>
					Please confirm that you want to permanently delete your account. This
					action cannot be undone, and you will lose all your data and access to
					our services.
				</p>
			</Modal>
		</section>
	);
}

export default Settings;
