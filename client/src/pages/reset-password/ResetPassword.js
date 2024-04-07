import {useState, useEffect} from 'react';
import CustomInput from '../../components/common/input/CustomInput';
import ResetPasswordSuccessCard from './ResetPasswordSuccessCard';
import ResetPasswordFailureCard from './ResetPasswordFailureCard';
import {useLocation} from 'react-router';
import {useApi} from '../../hooks/useApi';
import {useNavigate} from 'react-router-dom';
import './ResetPassword.css';

function ResetPassword() {
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [errorMsg, setErrorMsg] = useState('');
	const [success, setSuccess] = useState(false);
	const [countdown, setCountdown] = useState(3);
	const [token, setToken] = useState(null);
	const navigate = useNavigate();
	const location = useLocation();
	const {
		makeRequest,
		loading,
		data,
		errorMsg: apiErrorMsg,
	} = useApi({
		url: `api/auth/reset-password`,
		method: 'patch',
		data: {newPassword, confirmPassword, token},
	});
	const {makeRequest: makeTokenRequest, errorMsg: tokenError} = useApi({
		url: `api/auth/reset-password${location?.search}`,
		method: 'get',
	});

	let emptyPassword = newPassword.length < 8 || newPassword.length > 30;
	let submitButtonDisabled = emptyPassword || loading;
	const handleSubmit = async (event) => {
		event.preventDefault();
		setErrorMsg('');
		if (confirmPassword === newPassword) {
			let success = await makeRequest();
			if (success) {
				setSuccess(true);
			} else {
				setErrorMsg(apiErrorMsg);
			}
		} else {
			setErrorMsg('Passwords do not match!');
		}
	};

	useEffect(() => {
		let extractedToken = location?.search.replace('?token=', '');
		if (extractedToken) {
			(async () => {
				let success = await makeTokenRequest();
				if (success) setToken(extractedToken);
			})();
		} else {
			navigate('/welcome');
		}
	}, []);

	console.log(loading);

	useEffect(() => {
		let timer = null;
		if (success) {
			timer = setInterval(() => {
				if (countdown > 0) {
					setCountdown((prevCount) => prevCount - 1);
				} else {
					clearInterval(timer);
					navigate('/signin');
				}
			}, 1000);
		}
		return () => {
			clearInterval(timer);
		};
	}, [success, countdown]);
	console.log(data);
	console.log(success);
	return success ? (
		<ResetPasswordSuccessCard
			countdown={countdown}
			successMsg={data?.message}
		/>
	) : tokenError ? (
		<ResetPasswordFailureCard error={tokenError} />
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
					<button
						type='submit'
						disabled={submitButtonDisabled}
						className='reset-password-submit-button'
					>
						Submit
					</button>
				</form>
			</div>
		</section>
	);
}

export default ResetPassword;
