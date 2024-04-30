import {useState} from 'react';
import CustomInput from '../common/input/CustomInput';

const ChangePasswordForm = () => {
	const [oldPassword, setOldPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [repeatNewPassword, setRepeatNewPassword] = useState('');
	const [validationErrors, setChangePasswordValidationErrors] = useState({});

	return (
		<div className='profile-sub-cont'>
			<h2 className='profile-heading'>Change Password</h2>
			<p
				className={`form-error ${Object.values(validationErrors).length > 0 ? '' : 'hidden'}`}
				aria-live='assertive'
				role='alert'
			>
				{Object.values(validationErrors)[0] || ' '}
			</p>
			<form>
				<CustomInput
					name='old password'
					type='password'
					id='old password'
					label='old password'
					value={oldPassword}
					required
					onChange={(e) => setOldPassword(e.target.value)}
				/>

				<CustomInput
					name='new password'
					type='password'
					id='new password'
					label='new password'
					value={newPassword}
					required
					onChange={(e) => setNewPassword(e.target.value)}
				/>

				<CustomInput
					name='repeat new password'
					type='password'
					id='repeat new password'
					label='repeat new password'
					value={repeatNewPassword}
					required
					onChange={(e) => setRepeatNewPassword(e.target.value)}
				/>
				<button className='profile-button' type='submit'>
					Save
				</button>
			</form>
		</div>
	);
};

export default ChangePasswordForm;
