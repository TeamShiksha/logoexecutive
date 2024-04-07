import './ResetPasswordSuccessCard.css';

function ResetPasswordSuccessCard({countdown, successMsg}) {
	return (
		<section className='reset-success-card-wrapper' role='reset-success-alert'>
			<div className='reset-success-card'>
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
					className='reset-success-icon'
				>
					<polyline points='20 6 9 17 4 12'></polyline>
				</svg>
				<h3 className='reset-success-title'>Password Reset Successful</h3>
				<p className='reset-success-message'>{successMsg}</p>
				<div className='reset-success-countdown'>
					<p>Redirecting to sign in </p>
					<p>{countdown}</p>
				</div>
			</div>
		</section>
	);
}

export default ResetPasswordSuccessCard;
