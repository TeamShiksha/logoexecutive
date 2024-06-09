import {useState, useEffect} from 'react';
import {useLocation} from 'react-router';
import {useNavigate} from 'react-router-dom';
import CustomInput from '../../components/common/input/CustomInput';
import {useApi} from '../../hooks/useApi';
import ResponseCard from '../../components/common/responseCard/ResponseCard';
import {FaCheck} from 'react-icons/fa6';
import {RxCross2} from 'react-icons/rx';
import useCountdownTimer from '../../hooks/useCountdownTimer';
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

	useEffect(() => {
		setErrorMsg(apiErrorMsg);
	}, [apiErrorMsg]);

	const handleSubmit = async (event) => {
		event.preventDefault();
		setErrorMsg('');
		if (newPassword.length < 8) {
			setErrorMsg('Password must be at least 8 characters');
			return;
		} else if (newPassword.length > 30) {
			setErrorMsg('Password must be 30 characters or fewer');
			return;
		} else if (confirmPassword !== newPassword) {
			setErrorMsg('Password and Confirm password do not match');
			return;
		} else {
			let success = await makeRequest();
			if (success) {
				setSuccess(true);
			}
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
			navigate('/home');
		}
	}, []);

	useCountdownTimer(success, navigate, countdown, setCountdown, '/signin');

	return tokenError ? (
		<ResponseCard
			message={tokenError}
			Icon={<RxCross2 className='response-failure-icon' />}
			title={'Invalid Token'}
		/>
	) : success ? (
		<ResponseCard
			countdown={countdown}
			message={data?.message}
			Icon={<FaCheck className='response-success-icon' />}
			title={'Password Reset Successful'}
		/>
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
						disabled={loading}
					/>
					<CustomInput
						name='confirm password'
						label='Confirm Password'
						type='password'
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						disabled={loading}
					/>
					<button
						type='submit'
						disabled={loading}
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
