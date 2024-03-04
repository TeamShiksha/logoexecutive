import React from 'react';
import {render, screen} from '@testing-library/react';

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
		render(<PricingCard content={mockContent} selectMonthly={true} />);
		expect(screen.getByText('test-Title')).toBeInTheDocument();
		expect(screen.getByText('test-Tagline')).toBeInTheDocument();
		expect(screen.getByText('₹100')).toBeInTheDocument();
		expect(screen.getByText('/month')).toBeInTheDocument();
		expect(screen.getByTestId('pricing-card')).toBeInTheDocument();
		expect(screen.getByText('test-Label')).toBeInTheDocument();
		expect(screen.getByText('Feature 1')).toBeInTheDocument();
		expect(screen.getByText('Feature 2')).toBeInTheDocument();
	});
});
