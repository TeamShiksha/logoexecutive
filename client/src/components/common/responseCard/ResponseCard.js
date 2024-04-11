import PropTypes from 'prop-types';
import './ResponseCard.css';

function ResponseCard({countdown, message, title, Icon}) {
	return (
		<section className='response-card-wrapper' role='response-alert'>
			<div className='response-card'>
				{Icon}
				<h3 className='response-title'>{title}</h3>
				<p className='response-message'>{message}</p>

				{countdown && (
					<div className='response-countdown'>
						<p>Redirecting to sign in </p>
						<p>{countdown}</p>
					</div>
				)}
			</div>
		</section>
	);
}

ResponseCard.propTypes = {
	title: PropTypes.string.isRequired,
	message: PropTypes.string.isRequired,
	Icon: PropTypes.element.isRequired,
	countdown: PropTypes.number,
};

export default ResponseCard;
