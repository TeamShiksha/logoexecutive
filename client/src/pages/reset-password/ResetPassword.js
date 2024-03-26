import {useState, useEffect} from 'react';
import CustomInput from '../../components/common/input/CustomInput';
import './ResetPassword.css';
import ResetPasswordSuccessCard from './ResetPasswordSuccessCard';
import {useLocation} from 'react-router';
import {useApi} from '../../hooks/useApi';

function ResetPassword() {
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [errorMsg, setErrorMsg] = useState('');
	const [success, setSuccess] = useState(false);
	const [token, setToken] = useState(null);

	const location = useLocation();

	const {makeRequest} = useApi({
		url: `api/auth/reset-password`,
		method: 'patch',
		data: {newPassword, confirmPassword, token},
	});

	useEffect(() => {
		let extractedToken = location?.search.replace('?token=', '');
		if (extractedToken) {
			setToken(extractedToken);
		} else {
			console.error('No token found in the URL');
		}
	}, []);

	const handleSubmit = (event) => {
		event.preventDefault();
		setErrorMsg('');
		if (newPassword === confirmPassword) {
			makeRequest();
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
