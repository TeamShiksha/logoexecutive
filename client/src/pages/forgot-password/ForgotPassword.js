import {useState} from 'react';
import {NavLink} from 'react-router-dom';
import CustomInput from '../../components/common/input/CustomInput';
import './ForgotPassword.css';

function ForgotPassword() {
	const [userEmail, setUserEmail] = useState('');
	const [errorMsg, setErrorMsg] = useState('');
	const [successMsg, setSuccessMsg] = useState('');
	function handleUserEmailChange(e) {
		setUserEmail(e.target.value);
	}
	function handleSubmit(e) {
		e.preventDefault();
		setErrorMsg('');
		setSuccessMsg('');
		if (userEmail === 'testing@gmail.com') {
			setSuccessMsg(`✓ Email sent! Check your inbox for the reset link.`);
		} else {
			setErrorMsg(`No account found! Please double-check your email.`);
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
				{successMsg && (
					<p
						className='forgot-password-success'
						aria-live='assertive'
						role='alert'
					>
						{successMsg}
					</p>
				)}
				<form onSubmit={handleSubmit}>
					<CustomInput
						type='email'
						label='Enter Your Email'
						value={userEmail}
						name='userEmail'
						onChange={handleUserEmailChange}
					/>
					<button type='submit'>Submit</button>
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
