import {describe, it, expect} from 'vitest';
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
		expect(screen.getByText('test-Title')).toBeDefined();
		expect(screen.getByText('test-Tagline')).toBeDefined();
		expect(screen.getByText('₹100')).toBeDefined();
		expect(screen.getByText('/month')).toBeDefined();
		expect(screen.getByTestId('pricing-card')).toBeDefined();
		expect(screen.getByText('test-Label')).toBeDefined();
		expect(screen.getByText('Feature 1')).toBeDefined();
		expect(screen.getByText('Feature 2')).toBeDefined();
	});
});
