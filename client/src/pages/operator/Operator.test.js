import React from 'react';
import {render, fireEvent, screen, waitFor} from '@testing-library/react';
import axios from 'axios';

import Operator from './Operator';

describe('Operator Component', () => {
	beforeEach(async () => {
		await axios.get('api/operator/data', {
			params: {model: 'ContactUs', page: 1, limit: 1, active: true},
		});
	});

	afterEach(() => {
		axios.mockClear();
	});

	test('renders ACTIVE tab by default', () => {
		render(<Operator />);
		expect(screen.getByText('ACTIVE')).toHaveClass('active');
		expect(screen.getByText('Test Message 1')).toBeInTheDocument();
	});

	test('switches to ARCHIVED tab when clicked', () => {
		render(<Operator />);
		fireEvent.click(screen.getByText('ARCHIVED'));
		expect(screen.getByText('ARCHIVED')).toHaveClass('active');
		expect(screen.getByText('Test Message 2')).toBeInTheDocument();
	});

	test('opens modal with query details on Respond button click', () => {
		render(<Operator />);
		fireEvent.click(screen.getByText('Respond'));
		expect(screen.getByText('Respond to Customer')).toBeInTheDocument();
		expect(screen.getByText('Inquiry:')).toBeInTheDocument();
	});

	test('sends response on clicking Send button and closes modal', async () => {
		render(<Operator />);

		fireEvent.click(screen.getByText('Respond'));

		expect(screen.getByText('Respond to Customer')).toBeInTheDocument();

		fireEvent.change(
			screen.getByPlaceholderText('Write your response here...'),
			{target: {value: 'Test response'}},
		);

		fireEvent.click(screen.getByText('Send'));

		await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));
		expect(axios.put).toHaveBeenCalledWith(
			'api/operator/revert',
			expect.any(Object),
			expect.any(Object),
		);

		await waitFor(() =>
			expect(screen.queryByText('Respond to Customer')).not.toBeInTheDocument(),
		);
	});

	test('displays error message on API failure', async () => {
		axios.put.mockRejectedValueOnce({
			response: {data: {message: 'Failed to send response'}},
		});

		render(<Operator />);
		fireEvent.click(screen.getByText('Respond'));

		fireEvent.change(
			screen.getByPlaceholderText('Write your response here...'),
			{target: {value: 'Test response'}},
		);
		fireEvent.click(screen.getByText('Send'));

		await screen.findByText('Failed to send response');
	});
});
