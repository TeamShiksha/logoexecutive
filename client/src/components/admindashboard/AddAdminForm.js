import PropTypes from 'prop-types';
import {useState} from 'react';
import CustomInput from '../common/input/CustomInput';
import './AddAdminForm.css';

function AddAdminForm({setAdminDetails}) {
	const [email, setEmail] = useState('');
	const [reason, setReason] = useState('');
	function handleEmailChange(event) {
		setEmail(event.target.value);
	}
	function handleReasonChange(event) {
		setReason(event.target.value);
	}
	function handleSubmit(event) {
		event.preventDefault();
		setAdminDetails((prev) => [
			...prev,
			{
				email: email,
				reason: reason,
				createDate: new Date().toLocaleDateString('en-US', {
					month: 'short',
					day: '2-digit',
					year: 'numeric',
				}),
			},
		]);
		setEmail('');
		setReason('');
	}
	return (
		<form onSubmit={handleSubmit} className='add-admin-form'>
			<CustomInput
				type='email'
				label='Admin Email'
				name='adminemail'
				value={email}
				onChange={handleEmailChange}
			/>
			<CustomInput
				type='text'
				label='reason'
				name='reason'
				value={reason}
				onChange={handleReasonChange}
			/>
			<button type='submit'>Add Admin</button>
		</form>
	);
}

AddAdminForm.propTypes = {
	setAdminDetails: PropTypes.func.isRequired,
};

export default AddAdminForm;
