import {NavLink} from 'react-router-dom';
import './ResetPasswordSuccessCard.css';

function ResetPasswordSuccessCard() {
	return (
		<section className='reset-success-card-wrapper'>
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
				<p className='reset-success-message'>
					Your password has been successfully reset. You can now sign in with
					your new password.
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

export default ResetPasswordSuccessCard;
