import {render, screen} from '@testing-library/react';
import CurrentPlan from './CurrentPlan';
import {SubscriptionTypes} from '../../constants';

describe('CurrentPlan', () => {
	it('renders CurrentPlan', () => {
		render(
			<CurrentPlan
				subscriptionType={SubscriptionTypes.HOBBY}
				isActive={true}
			/>,
		);
		expect(screen.getByText('Current Plan')).toBeInTheDocument();
	});

	it('displays the correct plan details', () => {
		render(
			<CurrentPlan
				subscriptionType={SubscriptionTypes.HOBBY}
				isActive={true}
			/>,
		);

		expect(screen.getByText('Current Plan')).toBeInTheDocument();
		expect(screen.getByText('Active')).toBeInTheDocument();
		expect(screen.getByText('Hobby')).toBeInTheDocument();
		expect(
			screen.getByText(
				'Empower your projects with essential tools, at no cost.',
			),
		).toBeInTheDocument();
		expect(screen.getByText('Upgrade Plan')).toBeInTheDocument();
	});

	it('Displays button if the plan is Hobby', async () => {
		render(
			<CurrentPlan
				subscriptionType={SubscriptionTypes.HOBBY}
				isActive={true}
			/>,
		);

		expect(screen.getByText('Upgrade Plan')).toBeInTheDocument();
	});

	it('Do not display button if the plan is not Hobby', async () => {
		render(
			<CurrentPlan
				subscriptionType={SubscriptionTypes.TEAMS}
				isActive={true}
			/>,
		);

		expect(screen.queryByText('Upgrade Plan')).not.toBeInTheDocument();
	});

	it('Status Inactive when isActive is false', async () => {
		render(
			<CurrentPlan
				subscriptionType={SubscriptionTypes.TEAMS}
				isActive={false}
			/>,
		);

		expect(screen.getByText('Inactive')).toBeInTheDocument();
	});
});
