import React from 'react';
import {render, fireEvent, screen} from '@testing-library/react';
import axios from 'axios';
import Operator from './Operator';
import {OperatorContext} from '../../contexts/OperatorContext';

jest.mock('axios');

describe('Operator Component', () => {
	const mockQueries = {
		pages: 1,
		results: [
			{
				_id: '66bf3695a4e3b9dab1d6f8e9',
				email: 'ayushsanjpro7@gmail.com',
				name: 'Ayush seven',
				message: 'Give me some logos.....',
				activityStatus: false,
				assignedTo: null,
				createdAt: '2024-08-16T11:23:01.684Z',
				updatedAt: '2024-08-16T11:23:01.684Z',
				__v: 0,
			},
			{
				_id: '66bf3695a4e3b9dab1d6f8e7',
				email: 'ayushsanjpro9@gmail.com',
				name: 'Ayush seven',
				message: 'I need few logos for my company',
				activityStatus: true,
				assignedTo: '66ba2bc6cff9dbf40b729063',
				createdAt: '2024-08-16T11:23:01.684Z',
				updatedAt: '2024-08-16T11:23:01.684Z',
				reply: 'Here are the logos',
				__v: 0,
			},
		],
	};

	const fetchQueries = jest.fn();

	const renderOperator = (queries = mockQueries) => {
		render(
			<OperatorContext.Provider value={{queries, fetchQueries}}>
				<Operator />
			</OperatorContext.Provider>,
		);
	};

	it('renders Operator with all its components', () => {
		renderOperator();
		const operatorContainer = screen.getByTestId('testid-operator');
		expect(operatorContainer).toBeInTheDocument();
		const tabs = screen.getByTestId('tabs-container');
		expect(tabs).toBeInTheDocument();
		const tabsContainer = screen.getByTestId('tab-content-container');
		expect(tabsContainer).toBeInTheDocument();
	});

	it('renders ACTIVE tab by default', () => {
		renderOperator();
		expect(screen.getByText('ACTIVE')).toHaveClass('active');
		expect(screen.getByText('Give me some logos.....')).toBeInTheDocument();
	});

	it('switches to ARCHIVED tab when clicked', () => {
		renderOperator();
		fireEvent.click(screen.getByText('ARCHIVED'));
		expect(screen.getByText('ARCHIVED')).toHaveClass('active');
		expect(
			screen.getByText('I need few logos for my company'),
		).toBeInTheDocument();
	});

	it('opens modal on Respond button click', () => {
		renderOperator({pages: 1, results: [mockQueries.results[0]]});
		fireEvent.click(screen.getByText('Respond'));
		expect(
			screen.getByRole('heading', {name: 'Respond to Customer', exact: true}),
		).toBeInTheDocument();
	});

	it('sends response on clicking Send button and closes modal', async () => {
		renderOperator({pages: 1, results: [mockQueries.results[0]]});

		fireEvent.click(screen.getByText('Respond'));

		expect(screen.getByText('Respond to Customer')).toBeInTheDocument();

		fireEvent.change(
			screen.getByPlaceholderText('Write your response here...'),
			{target: {value: 'Test response'}},
		);

		fireEvent.click(screen.getByText('Send'));

		expect(axios.put).toHaveBeenCalledWith(
			'api/operator/revert',
			expect.any(Object),
			expect.any(Object),
		);
	});
});
