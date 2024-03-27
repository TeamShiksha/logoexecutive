import {useState} from 'react';
import Modal from '../common/modal/Modal';
import './Settings.css';

function Settings() {
	const [modalOpen, setModalOpen] = useState(false);
	const openModal = () => setModalOpen(true);
	return (
		<section className='settings'>
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
			<Modal modalOpen={modalOpen} setModal={setModalOpen} showButtons={true}>
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
