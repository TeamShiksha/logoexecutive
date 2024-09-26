import Modal from '../common/modal/Modal';
import CustomInput from '../common/input/CustomInput';
import {useState} from 'react';
import './RaiseRequestModal.css';

function RaiseRequestModal({modalOpen, setModal}) {
	const [userEmail, setUserEmail] = useState('');
	const [companyUrl, setCompanyUrl] = useState('');

	const handleEmailInputChange = (e) => {
		setUserEmail(e.target.value);
	};

	const handleCompanyUrlChange = (e) => {
		setCompanyUrl(e.target.value);
	};

	return (
		<Modal
			modalOpen={modalOpen}
			setModal={setModal}
			containerClassName='raise-request-modal-container'
		>
			<form className='raise-request-form'>
				<CustomInput
					type='email'
					label='email'
					value={userEmail}
					name='userEmail'
					onChange={handleEmailInputChange}
				/>
				<CustomInput
					type='url'
					label='company url'
					value={companyUrl}
					name='companyUrl'
					onChange={handleCompanyUrlChange}
				/>
				<button className='raise-request-modal-submit-button' type='submit'>
					Submit
				</button>
			</form>
		</Modal>
	);
}

export default RaiseRequestModal;
