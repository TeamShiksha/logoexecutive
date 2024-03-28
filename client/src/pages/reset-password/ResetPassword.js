import {useState} from 'react';
import CustomInput from '../../components/common/input/CustomInput';
import ResetPasswordSuccessCard from './ResetPasswordSuccessCard';
import './ResetPassword.css';

function ResetPassword() {
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [errorMsg, setErrorMsg] = useState('');
	const [success, setSuccess] = useState(false);
	const handleSubmit = (event) => {
		event.preventDefault();
		setErrorMsg('');
		if (newPassword === confirmPassword) {
			setSuccess(true);
		} else {
			setErrorMsg(
				"Passwords don't match! Please double-check and re-enter them.",
			);
		}
	};

	return success ? (
		<ResetPasswordSuccessCard />
	) : (
		<section className='reset-password-wrapper'>
			<div className='reset-password-page'>
				<h3 className='reset-password-title'>Reset Password</h3>
				<p className='reset-password-description'>
					Enter your new password below
				</p>
				{errorMsg && (
					<p
						className='reset-password-error'
						aria-live='assertive'
						role='alert'
					>
						{errorMsg}
					</p>
				)}
				<form onSubmit={handleSubmit}>
					<CustomInput
						name='new password'
						label='New Password'
						type='password'
						value={newPassword}
						onChange={(e) => setNewPassword(e.target.value)}
					/>
					<CustomInput
						name='confirm password'
						label='Confirm Password'
						type='password'
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
					/>
					<button type='submit' className='reset-password-submit-button'>
						Submit
					</button>
				</form>
			</div>
		</section>
	);
}

export default ResetPassword;
