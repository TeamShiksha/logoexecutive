import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import './verificationState.css';

function VerificationState({loading, isSuccess, errorMsg, successMessage}) {
	const navigate = useNavigate();
	const [timer, setTimer] = useState(3);
	useEffect(() => {
		if (isSuccess) {
			const timerId = setInterval(() => {
				setTimer((prevTimer) => {
					if (prevTimer === 1) {
						navigate('/welcome');
						clearInterval(timerId);
						return;
					}
					return prevTimer - 1;
				});
			}, 1000);
			return () => clearInterval(timerId);
		}
	}, [isSuccess]);

	return (
		<section data-testid='verification-card' className='card-wrapper'>
			<div className='state-card'>
				{loading ? (
					<h3 className='state-title'>Loading...</h3>
				) : isSuccess ? (
					<>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							width='24'
							height='24'
							viewBox='0 0 24 24'
							fill='none'
							stroke='currentColor'
							strokeWidth='2'
							strokeLinecap='round'
							strokeLinejoin='round'
							className='state-icon'
							data-testid='success-icon'
						>
							<polyline points='20 6 9 17 4 12'></polyline>
						</svg>
						<h3 className='state-title'>{successMessage}</h3>
						<p className='state-message'>Redirecting you in {timer}s ...</p>
					</>
				) : (
					<>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							width='40'
							height='40'
							viewBox='0 0 24 24'
							fill='none'
							stroke='red'
							strokeWidth='2'
							strokeLinecap='round'
							strokeLinejoin='round'
							className='error-icon'
							data-testid='error-icon'
						>
							<line x1='18' y1='6' x2='6' y2='18'></line>
							<line x1='6' y1='6' x2='18' y2='18'></line>
						</svg>
						<h3 className='state-title'>{errorMsg}</h3>
						<p className='state-message'>Failed to verify your account</p>
					</>
				)}
			</div>
		</section>
	);
}

export default VerificationState;
