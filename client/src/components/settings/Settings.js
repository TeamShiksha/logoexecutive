import {useContext, useState} from 'react';
import Modal from '../common/modal/Modal';
import './Settings.css';
import {useApi} from '../../hooks/useApi';
import {useNavigate} from 'react-router-dom';
import {AuthContext} from '../../contexts/AuthContext';

function Settings() {
	const [modalOpen, setModalOpen] = useState(false);
	const [showDeleteResponseModal, setShowDeleteResponseModal] = useState(false);
	const navigate = useNavigate();
	const {logout} = useContext(AuthContext);
	const {makeRequest, error, data} = useApi({
		url: 'api/user/delete',
		method: 'delete',
	});

	if (error) return;

	const openModal = () => setModalOpen(true);

	const handleConfirm = async () => {
		try {
			const response = await makeRequest();

			if (response) {
				setModalOpen(false);
				setShowDeleteResponseModal(true);

				setTimeout(() => {
					logout();
					navigate('/');
					localStorage.clear();
				}, 3000);
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
			{showDeleteResponseModal && (
				<Modal modalOpen showButtons={false} showCloseIcon={false}>
					<p>{data?.message}</p>
				</Modal>
			)}
		</section>
	);
}

export default Settings;
