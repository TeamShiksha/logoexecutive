import {render, screen} from '@testing-library/react';
import CurrentPlan from './CurrentPlan';
import {SubscriptionTypes} from '../../constants';

describe('CurrentPlan', () => {
	const subscriptionData = {
		isActive: false,
		subscriptionType: SubscriptionTypes.HOBBY,
	};

	it('Status - Inactive', () => {
		render(<CurrentPlan subscriptionData={subscriptionData} />);
		expect(screen.getByText('Current Plan')).toBeInTheDocument();
		expect(screen.getByText('Inactive')).toBeInTheDocument();
		expect(screen.getByText('Inactive')).not.toHaveClass('active');
		expect(
			screen.getByText(
				'Empower your projects with essential tools, at no cost.',
			),
		).toBeInTheDocument();
	});

	it('Status - Active', () => {
		const data = {...subscriptionData, isActive: true};
		render(<CurrentPlan subscriptionData={data} />);
		expect(screen.getByText('Current Plan')).toBeInTheDocument();
		expect(screen.getByText('Active')).toBeInTheDocument();
		expect(screen.getByText('Active')).toHaveClass('active');
		expect(
			screen.getByText(
				'Empower your projects with essential tools, at no cost.',
			),
		).toBeInTheDocument();
		expect(screen.getByText('Upgrade Plan')).toBeInTheDocument();
	});

	it('Upgrade button - shows for hobby plan', () => {
		render(<CurrentPlan subscriptionData={subscriptionData} />);
		expect(screen.getByText('Upgrade Plan')).toBeInTheDocument();
	});

	it('Upgrade button - hidden for teams', () => {
		const data = {
			...subscriptionData,
			subscriptionType: SubscriptionTypes.TEAMS,
		};
		render(<CurrentPlan subscriptionData={data} />);
		expect(screen.queryByText('Upgrade Plan')).toBeNull();
	});
});
