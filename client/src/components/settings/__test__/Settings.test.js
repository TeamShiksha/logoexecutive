import React from 'react';
import {render, fireEvent, screen} from '@testing-library/react';
import Settings from '../Settings';

describe('Settings component', () => {
	test('renders Settings component correctly', () => {
		/** Arrange */
		const {asFragment} = render(<Settings />);
		/** Assert */
		// Snapshot testing for the initial rendering
		expect(asFragment()).toMatchSnapshot();
	});

	test('opens modal when "Delete Account" button is clicked', () => {
		/** Arrange */
		render(<Settings />);

		/** Act */
		// Click the "Delete Account" button
		fireEvent.click(screen.getByText('Delete Account'));

		/** Assert */
		// Now, the modal should be open
		expect(screen.getByText('Are you sure?')).toBeInTheDocument();
	});
});
