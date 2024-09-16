import {describe, it, expect} from 'vitest';
import {render, fireEvent, screen} from '@testing-library/react';
import Pricing from './Pricing';
import {pricingCardsContent} from '../../constants';

describe('Pricing component', () => {
	it('by default, Monthly should be selected', () => {
		render(<Pricing />);
		const monthlySwitch = screen.getByTestId('monthly');
		const annuallySwitch = screen.getByTestId('annually');
		expect(monthlySwitch).toHaveClass('active');
		expect(annuallySwitch).not.toHaveClass('active');
	});

	it('switches between Monthly and Annually views on switch click', () => {
		render(<Pricing />);
		const monthlySwitch = screen.getByTestId('monthly');
		const annuallySwitch = screen.getByTestId('annually');

		expect(monthlySwitch).toHaveClass('active');
		expect(annuallySwitch).not.toHaveClass('active');

		fireEvent.click(annuallySwitch);
		expect(monthlySwitch).not.toHaveClass('active');
		expect(annuallySwitch).toHaveClass('active');

		fireEvent.click(monthlySwitch);
		expect(monthlySwitch).toHaveClass('active');
		expect(annuallySwitch).not.toHaveClass('active');
	});

	it('renders pricing cards based on pricingCardsContent', () => {
		render(<Pricing />);
		const pricingCardComponents = screen.getAllByTestId('pricing-card');
		expect(pricingCardComponents.length).toBe(pricingCardsContent.length);
	});
});
