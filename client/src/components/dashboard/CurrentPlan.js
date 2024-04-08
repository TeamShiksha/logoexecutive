import {SubscriptionTypes} from '../../constants';

function CurrentPlan({subscriptionData}) {
	return (
		<div className='dashboard-content-item'>
			<div className='current-plan-header'>
				<h3 className='content-item-heading'>Current Plan</h3>
				<div
					className={`current-plan-status ${subscriptionData?.isActive ? 'active' : ''}`}
				>
					{subscriptionData?.isActive ? 'Active' : 'Inactive'}
				</div>
			</div>
			<h4 className='current-plan'>{subscriptionData?.subscriptionType}</h4>
			<p className='current-plan-tagline'>
				Empower your projects with essential tools, at no cost.
			</p>
			{subscriptionData?.subscriptionType === SubscriptionTypes.HOBBY ? (
				<button className='upgrade-button'>Upgrade Plan</button>
			) : (
				<button className='upgrade-button'>Explore plans</button>
			)}
		</div>
	);
}

export default CurrentPlan;
