import './ResetPasswordSuccessCard.css';

function ResetPasswordSuccessCard({
	countdown,
	successMsg = false,
	errorMsg = false,
}) {
	return (
		<section className='reset-success-card-wrapper' role='reset-success-alert'>
			{errorMsg ? (
				<div className='reset-failure-card'>
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
						className='reset-error-icon'
					>
						<line x1='18' y1='6' x2='6' y2='18'></line>
						<line x1='6' y1='6' x2='18' y2='18'></line>
					</svg>
					<h3 className='reset-success-title'>Invalid Token</h3>
					<p className='reset-success-message'>{errorMsg}</p>
				</div>
			) : (
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
			)}
		</section>
	);
}

export default ResetPasswordSuccessCard;
