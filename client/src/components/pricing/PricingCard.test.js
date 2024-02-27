/** 3P imports */
import React from 'react';
import {render, screen} from '@testing-library/react';

/** Components  */
import PricingCard from './PricingCard';

describe('PricingCard component', () => {
	const mockContent = {
		title: 'test-Title',
		tagline: 'test-Tagline',
		price: '₹100',
		period: true,
		features: ['Feature 1', 'Feature 2'],
		label: 'test-Label',
	};

	it('displays the correct content', () => {
		// Act
		render(<PricingCard content={mockContent} selectMonthly={true} />);

		// Assert
		expect(screen.getByText('test-Title')).toBeInTheDocument();
		expect(screen.getByText('test-Tagline')).toBeInTheDocument();
		expect(screen.getByText('₹100')).toBeInTheDocument();
		expect(screen.getByText('/month')).toBeInTheDocument();
		expect(screen.getByTestId('pricing-card')).toBeInTheDocument();
		expect(screen.getByText('test-Label')).toBeInTheDocument();

		// You can also check for features
		expect(screen.getByText('Feature 1')).toBeInTheDocument();
		expect(screen.getByText('Feature 2')).toBeInTheDocument();
	});
});
