import React from 'react';
import {render, screen} from '@testing-library/react';

import {months} from '../../constants';
import Usage from './Usage';

describe('Usage card Component', () => {
	const mockUsedCalls = 1000;
	const mockTotalCalls = 5000;
	const expectedPercentage = 20;

	const now = new Date();
	const nextMonth = months[(now.getMonth() + 1) % 12];
	const nextYear = now.getFullYear() + (now.getMonth() === 11 ? 1 : 0);

	test('Displays the usage card', () => {
		render(<Usage usedCalls={mockUsedCalls} totalCalls={mockTotalCalls} />);
		expect(screen.getByText('Usage')).toBeInTheDocument();
	});

	test('Displays the correct calls percentage', () => {
		render(<Usage usedCalls={mockUsedCalls} totalCalls={mockTotalCalls} />);
		expect(screen.getByText(`${expectedPercentage}%`)).toBeInTheDocument();
	});

	test('Displays the correct number of Used calls', () => {
		render(<Usage usedCalls={mockUsedCalls} totalCalls={mockTotalCalls} />);
		expect(screen.getByText(`${mockUsedCalls} calls`)).toBeInTheDocument();
	});

	test('Displays the correct number of Total calls', () => {
		render(<Usage usedCalls={mockUsedCalls} totalCalls={mockTotalCalls} />);
		expect(screen.getByText(`${mockTotalCalls} calls`)).toBeInTheDocument();
	});

	test('Displays the next reset date correctly', () => {
		render(<Usage usedCalls={mockUsedCalls} totalCalls={mockTotalCalls} />);
		expect(
			screen.getByText(`Next reset on the 1st of ${nextMonth} ${nextYear}`),
		).toBeInTheDocument();
	});
});
