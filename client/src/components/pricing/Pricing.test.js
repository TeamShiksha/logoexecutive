import React from 'react';
import {render, fireEvent, screen} from '@testing-library/react';
import Pricing from './Pricing';
import {pricingCardsContent} from '../../constants';

describe('Pricing component', () => {
	test('by default, Monthly should be selected', () => {
		render(<Pricing />);
		const monthlySwitch = screen.getByTestId('monthly');
		const annuallySwitch = screen.getByTestId('annually');
		expect(monthlySwitch).toHaveClass('active');
		expect(annuallySwitch).not.toHaveClass('active');
	});

	test('switches between Monthly and Annually views on switch click', () => {
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

	test('renders pricing cards based on pricingCardsContent', () => {
		render(<Pricing />);
		const pricingCardComponents = screen.getAllByTestId('pricing-card');
		expect(pricingCardComponents).toHaveLength(pricingCardsContent.length);
	});
});
