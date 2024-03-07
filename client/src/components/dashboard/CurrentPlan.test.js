import {render, screen} from '@testing-library/react';
import CurrentPlan from './CurrentPlan';

describe('CurrentPlan', () => {
	it('renders CurrentPlan', () => {
		render(<CurrentPlan />);
		expect(screen.getByText('Current Plan')).toBeInTheDocument();
	});

	it('displays the correct plan details', () => {
		render(<CurrentPlan />);

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
});
