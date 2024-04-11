import {FaCheck} from 'react-icons/fa6';
import {RxCross2} from 'react-icons/rx';
import PropTypes from 'prop-types';
import './ResponseCard.css';

function ResponseCard({countdown, successMsg, errorMsg, title}) {
	return (
		<section
			className='response-success-card-wrapper'
			role='response-success-alert'
		>
			{errorMsg ? (
				<div className='response-failure-card'>
					<RxCross2 className='response-failure-icon' />
					<h3 className='response-success-title'>{title}</h3>
					<p className='response-success-message'>{errorMsg}</p>
				</div>
			) : (
				<div className='response-success-card'>
					<FaCheck className='response-success-icon' />
					<h3 className='response-success-title'>{title}</h3>
					<p className='response-success-message'>{successMsg}</p>
					<div className='response-success-countdown'>
						<p>Redirecting to sign in </p>
						<p>{countdown}</p>
					</div>
				</div>
			)}
		</section>
	);
}

ResponseCard.propTypes = {
	title: PropTypes.string.isRequired,
	successMsg: PropTypes.string.isRequired,
	errorMsg: PropTypes.string.isRequired,
	countdown: PropTypes.number.isRequired,
};

export default ResponseCard;
