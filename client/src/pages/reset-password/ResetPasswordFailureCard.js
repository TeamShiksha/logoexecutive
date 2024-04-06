import './ResetPasswordSuccessCard.css';

function ResetPasswordFailureCard({error}) {
	return (
		<section className='reset-success-card-wrapper'>
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
				<p className='reset-success-message'>{error}</p>
			</div>
		</section>
	);
}

export default ResetPasswordFailureCard;
