import {useContext, useEffect, useState} from 'react';
import Modal from '../common/modal/Modal';
import {useApi} from '../../hooks/useApi';
import {useNavigate} from 'react-router-dom';
import {AuthContext} from '../../contexts/AuthContext';
import useCountdownTimer from '../../hooks/useCountdownTimer';
import ResponseCard from '../common/responseCard/ResponseCard';
import {FaCheck} from 'react-icons/fa6';
import './Settings.css';

function Settings() {
	const [modalOpen, setModalOpen] = useState(false);
	const [showDeleteResponseModal, setShowDeleteResponseModal] = useState(false);
	const [countdown, setCountdown] = useState(3);
	const navigate = useNavigate();
	const {logout} = useContext(AuthContext);
	const {data, errorMsg, loading, makeRequest, isSuccess} = useApi(
		{
			url: 'api/user/delete',
			method: 'delete',
		},
		true,
	);

	const openModal = () => setModalOpen(true);

	const handleConfirm = async () => {
		const response = await makeRequest();
		if (response) {
			setModalOpen(false);
			setTimeout(() => {
				logout();
			}, 3000);
		}
	};

	useEffect(() => {
		if (errorMsg) {
			setShowDeleteResponseModal(true);
			setModalOpen(false);
		} else {
			setShowDeleteResponseModal(false);
		}
	}, [errorMsg]);

	useCountdownTimer(isSuccess, navigate, countdown, setCountdown);

	return (
		<section className='settings' data-testid='testid-settings'>
			<h1 className='sett-cont-heading'>Settings</h1>
			<button disabled className='settings-button'>
				Download Account Data
			</button>
			<p className='setting-instruction'>Coming Soon ...</p>
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
				loading={loading}
			>
				<h2>Are you sure?</h2>
				<p className='settings-confirm-message'>
					Please confirm that you want to permanently delete your account. This
					action cannot be undone, and you will lose all your data and access to
					our services.
				</p>
			</Modal>
			{isSuccess && (
				<div className='settings-success-bg'>
					<ResponseCard
						countdown={countdown}
						message={data?.message}
						Icon={<FaCheck className='response-success-icon' />}
						title={'Delete Account Successful'}
						redirectTo='home page'
					/>
				</div>
			)}
			{showDeleteResponseModal && (
				<Modal
					modalOpen={showDeleteResponseModal}
					showButtons={false}
					showCloseIcon={true}
					setModal={setShowDeleteResponseModal}
				>
					<p className='delete-error-msg'>
						Something went wrong. Please try again later.
					</p>
				</Modal>
			)}
		</section>
	);
}

export default Settings;
