import PropTypes from 'prop-types';
import './SignUpSuccessCard.css';

const SignUpSuccessCard = ({message}) => {
	return (
		<section className='signup-success-card-wrapper'>
			<div className='signup-success-card'>
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
					className='signup-success-icon'
				>
					<title>Success Icon</title>
					<polyline points='20 6 9 17 4 12'></polyline>
				</svg>
				<h3 className='signup-success-title'>Sign-Up Submission Successful</h3>
				<p className='signup-success-message'>{message}</p>
			</div>
		</section>
	);
};

SignUpSuccessCard.propTypes = {
	message: PropTypes.string.isRequired,
};

export default SignUpSuccessCard;
