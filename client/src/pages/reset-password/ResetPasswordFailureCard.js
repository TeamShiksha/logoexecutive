import {NavLink} from 'react-router-dom';
import './ResetPasswordSuccessCard.css';

function ResetPasswordFailureCard({error}) {
	return (
		<section className='reset-success-card-wrapper'>
			<div className='reset-success-card'>
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
				<h3 className='reset-success-title'>{error}</h3>
				<p className='reset-success-message'>
					Your password has not been changed. Please try again later.
				</p>
				<NavLink className='reset-success-link' to='/signin'>
					<button className='reset-success-button' type='submit'>
						Return to Sign In
					</button>
				</NavLink>
			</div>
		</section>
	);
}

export default ResetPasswordFailureCard;
