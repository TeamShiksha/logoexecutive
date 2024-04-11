import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import './card.css';

function EmailVerificationSuccessCard() {
	const navigate = useNavigate();
	const [timer, setTimer] = useState(3);
	useEffect(() => {
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
	}, []);

	return (
		<section data-testid='success-card' className='success-card-wrapper'>
			<div className='success-card'>
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
					className='success-icon'
				>
					<polyline points='20 6 9 17 4 12'></polyline>
				</svg>
				<h3 className='success-title'>
					Email has been verified successfully
				</h3>
				<p className='success-message'>Redirecting you in {timer}s ...</p>
			</div>
		</section>
	);
}

export default EmailVerificationSuccessCard;
