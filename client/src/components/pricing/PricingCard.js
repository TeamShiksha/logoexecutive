import PropTypes from 'prop-types';
import {HiCheck} from 'react-icons/hi2';
import './PricingCard.css';

function PricingCard({content, selectMonthly}) {
	const calculatePrice = (price) => {
		return selectMonthly ? price : '₹19200';
	};
	const calculatePeriod = (period) => {
		return period ? (selectMonthly ? '/month' : '/year') : null;
	};
	const price = content.period ? calculatePrice(content.price) : content.price;
	const buttonText = ['Teams', 'Pro'].includes(content.title)
		? 'Coming Soon'
		: 'Get Started';

	return (
		<div className='pricing-card' data-testid='pricing-card'>
			<div>
				<h4>{content.title}</h4>
				{content.label && <p>{content.label}</p>}
			</div>
			<p>{content.tagline}</p>
			<h1>
				<span>{price}</span>
				{content.period && <span>{calculatePeriod(content.period)}</span>}
			</h1>
			<button>{buttonText}</button>
			<ul>
				{content.features.map((feature, index) => (
					<li key={index}>
						<HiCheck className='checkmark' />
						{feature}
					</li>
				))}
			</ul>
		</div>
	);
}

PricingCard.propTypes = {
	content: PropTypes.shape({
		title: PropTypes.string.isRequired,
		tagline: PropTypes.string.isRequired,
		price: PropTypes.string.isRequired,
		period: PropTypes.bool,
		features: PropTypes.array.isRequired,
		label: PropTypes.string,
	}).isRequired,
	selectMonthly: PropTypes.bool.isRequired,
};

export default PricingCard;
