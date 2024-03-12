import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import Settings from './Settings';

describe('Settings component', () => {
	test('renders settings component', () => {
		render(<Settings />);

		const headingElement = screen.getByText(/Settings/i);
		expect(headingElement).toBeInTheDocument();

		const downloadButton = screen.getByText(/Download Account Data/i);
		expect(downloadButton).toBeInTheDocument();

		const deleteButton = screen.getByText(/Delete Account/i);
		expect(deleteButton).toBeInTheDocument();
	});

	test('opens modal when delete button is clicked', () => {
		render(<Settings />);

		const modalElement = screen.queryByText(/Are you sure?/i);
		expect(modalElement).not.toBeInTheDocument();

		const deleteButton = screen.getByText(/Delete Account/i);
		fireEvent.click(deleteButton);

		const modalTitle = screen.getByText(/Are you sure?/i);
		expect(modalTitle).toBeInTheDocument();
	});
});
