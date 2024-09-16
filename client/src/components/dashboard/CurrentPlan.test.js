import {describe, it, expect} from 'vitest';
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
		expect(screen.getByText('Current Plan')).toBeDefined();
		expect(screen.getByText('Inactive')).toBeDefined();
		expect(screen.getByText('Inactive')).not.toHaveClass('active');
		expect(
			screen.getByText(
				'Empower your projects with essential tools, at no cost.',
			),
		).toBeDefined();
	});

	it('Status - Active', () => {
		const data = {...subscriptionData, isActive: true};
		render(<CurrentPlan subscriptionData={data} />);
		expect(screen.getByText('Current Plan')).toBeDefined();
		expect(screen.getByText('Active')).toBeDefined();
		expect(screen.getByText('Active')).toHaveClass('active');
		expect(
			screen.getByText(
				'Empower your projects with essential tools, at no cost.',
			),
		).toBeDefined();
		expect(screen.getByText('Upgrade Plan')).toBeDefined();
	});

	it('Upgrade button - shows for hobby plan', () => {
		render(<CurrentPlan subscriptionData={subscriptionData} />);
		expect(screen.getByText('Upgrade Plan')).toBeDefined();
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
