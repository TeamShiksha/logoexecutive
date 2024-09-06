import React from 'react';
import {render, fireEvent, screen, waitFor} from '@testing-library/react';
import axios from 'axios';
import Operator from './Operator';
import {UserContext} from '../../contexts/UserContext';

jest.mock('axios');

describe('Operator Component', () => {
	const mockQueries = [
		{
			_id: '66bf3695a4e3b9dab1d6f8e9',
			email: 'ayushsanjpro7@gmail.com',
			name: 'Ayush seven',
			message:
				'Contact us if you are experiencing issues with our product or have any questions',
			activityStatus: false,
			assignedTo: null,
			createdAt: '2024-08-16T11:23:01.684Z',
			updatedAt: '2024-08-16T11:23:01.684Z',
			__v: 0,
		},
	];

	const handleGetQueries = jest.fn();

	const renderOperator = (queries = mockQueries) => {
		render(
			<UserContext.Provider value={{queries, handleGetQueries}}>
				<Operator />
			</UserContext.Provider>,
		);
	};

	it('renders Operator with all its components', () => {
		renderOperator();
		const operatorContainer = screen.getByTestId('operator-container');
		expect(operatorContainer).toBeInTheDocument();
		const tabs = screen.getByTestId('tabs');
		expect(tabs).toBeInTheDocument();
		const tabsContainer = screen.getByTestId('tabs-content');
		expect(tabsContainer).toBeInTheDocument();
	});

	test('renders ACTIVE tab by default', () => {
		render(<Operator />);
		expect(screen.getByText('ACTIVE')).toHaveClass('active');
		expect(
			screen.getByText(
				'Contact us if you are experiencing issues with our product or have any questions',
			),
		).toBeInTheDocument();
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
