import PropTypes from 'prop-types';
import './ResponseCard.css';

function ResponseCard({
	countdown,
	message,
	title,
	Icon,
	redirectTo = 'sign in',
}) {
	return (
		<section className='response-card-wrapper'>
			<div className='response-card'>
				{Icon}
				<h3 className='response-title'>{title}</h3>
				<p className='response-message'>{message}</p>

				{countdown && (
					<div className='response-countdown'>
						<p>Redirecting to {redirectTo} </p>
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
	Icon: PropTypes.element,
	countdown: PropTypes.number,
	redirectTo: PropTypes.string,
};

export default ResponseCard;
