import {useState} from 'react';
import PricingCard from './PricingCard';
import {pricingCardsContent} from '../../constants';
import './Pricing.css';

function Pricing() {
	const [selectMonthly, setSelectMonthly] = useState(true);
	const handleSwitchChange = () => {
		setSelectMonthly((prev) => !prev);
	};

	return (
		<div className='pricing-container'>
			<section>
				<h1>Pricing Plans</h1>
				<p>
					Opt for a plan providing access to top-tier company logos. Boost your
					projects and brand with our superior API service.
				</p>
				<div className='switch-container'>
					<div
						className={selectMonthly ? 'active' : ''}
						onClick={handleSwitchChange}
						data-testid='monthly'
					>
						<span>Monthly</span>
					</div>
					<div
						className={selectMonthly ? '' : 'active'}
						onClick={handleSwitchChange}
						data-testid='annually'
					>
						<span>Annually</span>
					</div>
				</div>
			</section>
			<div className='pricing-cards'>
				{pricingCardsContent.map((cardContent, index) => (
					<PricingCard
						key={index}
						content={cardContent}
						selectMonthly={selectMonthly}
					/>
				))}
			</div>
		</div>
	);
}

export default Pricing;
