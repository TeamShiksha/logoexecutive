import './card.css';

function ResetPasswordFailureCard({isLoading, error}) {
	return (
		<section data-testid='failure-card' className='success-card-wrapper'>
			<div className='success-card'>
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
				>
					<line x1='18' y1='6' x2='6' y2='18'></line>
					<line x1='6' y1='6' x2='18' y2='18'></line>
				</svg>
				<h3 className='success-title'>{error}</h3>
				<p className='success-message'>Failed to verify your account</p>
			</div>
		</section>
	);
}

export default ResetPasswordFailureCard;
