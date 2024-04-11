import {IconContext} from 'react-icons/lib';
import {FaCheck} from 'react-icons/fa6';
import {RxCross2} from 'react-icons/rx';
import PropTypes from 'prop-types';
import './ResponseCard.css';

function ResponseCard({countdown, successMsg, errorMsg, title}) {
	return (
		<section className='reset-success-card-wrapper' role='reset-success-alert'>
			{errorMsg ? (
				<div className='reset-failure-card'>
					<RxCross2 className='reset-failure-icon' />
					<h3 className='reset-success-title'>{title}</h3>
					<p className='reset-success-message'>{errorMsg}</p>
				</div>
			) : (
				<div className='reset-success-card'>
					<FaCheck className='reset-success-icon' />
					<h3 className='reset-success-title'>{title}</h3>
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

ResponseCard.propTypes = {
	title: PropTypes.string.isRequired,
	successMsg: PropTypes.string.isRequired,
	errorMsg: PropTypes.string.isRequired,
	countdown: PropTypes.number.isRequired,
};

export default ResponseCard;
