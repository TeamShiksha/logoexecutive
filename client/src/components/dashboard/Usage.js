import PropTypes from 'prop-types';
import {months} from '../../constants';
import PieGraph from './PieGraph';

function Usage({usedCalls, totalCalls}) {
	const percentage = (usedCalls / totalCalls) * 100;
	const now = new Date();
	const nextMonth = months[(now.getMonth() + 1) % 12];
	const nextYear = now.getFullYear() + (now.getMonth() === 11 ? 1 : 0);

	return (
		<div className='dashboard-content-item'>
			<h6 className='content-item-heading'>Usage</h6>
			<div className='usage-body-container'>
				<div className='circular-chart'>
					<PieGraph percentage={percentage} colour='#4F46E5' fill='#E6E6FA' />
				</div>
				<div>
					<h6 className='data-heading'>Used</h6>
					<p className='data'>{usedCalls} calls</p>
					<h6 className='data-heading'>Limit</h6>
					<p className='data'>{totalCalls} calls</p>
				</div>
			</div>
			<p className='dashboard-reset-date'>
				Next reset on the 1st of {nextMonth} {nextYear}
			</p>
		</div>
	);
}

Usage.propTypes = {
	usedCalls: PropTypes.number.isRequired,
	totalCalls: PropTypes.number.isRequired,
};

export default Usage;
