import {useState} from 'react';
import {NavLink} from 'react-router-dom';
import CustomInput from '../../components/common/input/CustomInput';
import {useApi} from '../../hooks/useApi';
import './ForgotPassword.css';

function ForgotPassword() {
	const [userEmail, setUserEmail] = useState('');
	const [isSuccess, setIsSuccess] = useState(false);
	const {
		data: response,
		makeRequest,
		loading,
		errorMsg,
	} = useApi({
		url: `api/auth/forgot-password`,
		method: 'post',
		data: {email: userEmail},
	});

	function handleUserEmailChange(e) {
		setUserEmail(e.target.value);
	}
	async function handleSubmit(e) {
		e.preventDefault();
		setIsSuccess(false);
		const success = await makeRequest();

		if (success) {
			setIsSuccess(true);
			setUserEmail('');
		}
	}

	return (
		<div className='forgot-password-wrapper'>
			<section className='forgot-password-container'>
				<h2 className='forgot-password-heading'>Forgot Password</h2>
				<p className='forgot-password-instruction'>
					Enter the email you used to create your account.
				</p>
				{errorMsg && (
					<p
						className='forgot-password-error'
						aria-live='assertive'
						role='alert'
					>
						{errorMsg}
					</p>
				)}
				{isSuccess && (
					<p
						className='forgot-password-success'
						aria-live='assertive'
						role='alert'
					>
						{response?.message}
					</p>
				)}
				<form onSubmit={handleSubmit}>
					<CustomInput
						type='email'
						label='Enter Your Email'
						value={userEmail}
						name='userEmail'
						onChange={handleUserEmailChange}
						disabled={loading}
					/>
					<button type='submit' disabled={loading}>
						Submit
					</button>
				</form>
				<div className='forgot-password-action-text'>
					Remember your password?{' '}
					<NavLink to='/signin'>Go back to sign in</NavLink>
				</div>
			</section>
		</div>
	);
}

export default ForgotPassword;
