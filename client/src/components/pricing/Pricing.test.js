import React from 'react';
import {render, fireEvent, screen} from '@testing-library/react';
import Pricing from './Pricing';
import {pricingCardsContent} from '../../constants';

describe('Pricing component', () => {
	test('by default, Monthly should be selected', () => {
		// Act
		render(<Pricing />);
		const monthlySwitch = screen.getByTestId('monthly');
		const annuallySwitch = screen.getByTestId('annually');

		// Assert
		expect(monthlySwitch).toHaveClass('active');
		expect(annuallySwitch).not.toHaveClass('active');
	});

	test('switches between Monthly and Annually views on switch click', () => {
		// Act
		render(<Pricing />);
		const monthlySwitch = screen.getByTestId('monthly');
		const annuallySwitch = screen.getByTestId('annually');

		// Initial state
		expect(monthlySwitch).toHaveClass('active');
		expect(annuallySwitch).not.toHaveClass('active');

		// Click on Annually switch
		fireEvent.click(annuallySwitch);
		expect(monthlySwitch).not.toHaveClass('active');
		expect(annuallySwitch).toHaveClass('active');

		// Click on Monthly switch
		fireEvent.click(monthlySwitch);
		expect(monthlySwitch).toHaveClass('active');
		expect(annuallySwitch).not.toHaveClass('active');
	});

	test('renders pricing cards based on pricingCardsContent', () => {
		// Act
		render(<Pricing />);
		const pricingCardComponents = screen.getAllByTestId('pricing-card');

		// Assert
		expect(pricingCardComponents).toHaveLength(pricingCardsContent.length);
	});
});
