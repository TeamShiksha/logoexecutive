import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import Dashboard from './Dashboard';
import {UserContext} from '../../contexts/UserContext';

describe('Dashboard Component', () => {
	const mockUserData = {
		firstName: 'Anoop',
		lastName: 'Singh',
		email: 'aps08@gmail.com',
		userId: '99234290-a33b-40d1-a5d4-888e86d06cd1',
		userType: 'CUSTOMER',
		keys: [
			{
				keyId: '4d6544e38f5d4ad8bae546ea61e2b842',
				key: '4d6544e38f5d4ad8bae546ea61e2b842',
				usageCount: '0',
				keyDescription: 'Demo Key',
				updatedAt: new Date().toLocaleDateString('en-US', {
					day: '2-digit',
					month: 'short',
					year: 'numeric',
				}),
				createdAt: new Date().toLocaleDateString('en-US', {
					day: '2-digit',
					month: 'short',
					year: 'numeric',
				}),
			},
		],
		subscription: {
			subscriptionId: '4d6544e3-8f5d-4ad8-bae5-46ea61e2b842',
			subscriptionType: 'HOBBY',
			keyLimit: 2,
			usageLimit: 500,
			isActive: false,
			createdAt: '2024-04-11T10:24:38.501Z',
			updatedAt: '2024-04-11T10:24:38.501Z',
		},
	};
	const fetchUserData = jest.fn();
	const renderDashboard = () => {
		render(
			<UserContext.Provider value={{userData: mockUserData, fetchUserData}}>
				<Dashboard />
			</UserContext.Provider>,
		);
	};

	it('renders Dashboard with all its components', () => {
		renderDashboard();
		const dashboardContainer = screen.getByTestId('testid-dashboard');
		expect(dashboardContainer).toBeInTheDocument();
		const currentPlanComponent = screen.getByText('Current Plan');
		expect(currentPlanComponent).toBeInTheDocument();
		const usageComponent = screen.getByText('Usage');
		expect(usageComponent).toBeInTheDocument();
		const apiKeyFormComponent = screen.getByText('Generate your API key');
		expect(apiKeyFormComponent).toBeInTheDocument();
		const apiKeyTableComponent = screen.getByText('DESCRIPTION');
		expect(apiKeyTableComponent).toBeInTheDocument();
	});

	it('generates API key and adds to the list', async () => {
		renderDashboard();
		const descriptionInput = screen.getByLabelText('Description For API Key');
		fireEvent.change(descriptionInput, {target: {value: 'Test API Key'}});
		const generateButton = screen.getByText('Generate Key');
		fireEvent.click(generateButton);
		await waitFor(() => {
			expect(screen.getByText('Test API Key')).toBeInTheDocument();
		});
		const tableElement = screen.getByRole('table');
		const keyRows = screen.queryAllByRole('row', {container: tableElement});
		expect(keyRows).toHaveLength(3);
		expect(
			screen.getAllByText(
				new Date().toLocaleDateString('en-US', {
					day: '2-digit',
					month: 'long',
					year: 'numeric',
				}),
			),
		).toHaveLength(2);
	});

	it('Delete API key and remove from the list', () => {
		renderDashboard();
		const deleteButton = screen.getAllByTestId('api-key-delete');
		fireEvent.click(deleteButton[0]);
		const deletedApiKeyDescription = screen.queryByText('Demo Key');
		expect(deletedApiKeyDescription).not.toBeInTheDocument();
	});

	it('shows an error message when trying to generate a key without a description', async () => {
		renderDashboard();
		const button = screen.getByText('Generate Key');
		fireEvent.click(button);
		const errordocument = screen.getByText('Description cannot be empty');
		expect(errordocument).toBeInTheDocument();
	});

	it('shows an error message when trying to generate a key greater than 20 characters', () => {
		renderDashboard();
		const descriptionInput = screen.getByLabelText('Description For API Key');
		fireEvent.change(descriptionInput, {
			target: {value: 'Long string text more than twenty characters'},
		});
		const generateButton = screen.getByText('Generate Key');
		fireEvent.click(generateButton);
		const errordocument = screen.getByText(
			'Description cannot be more than 20 characters',
		);
		expect(errordocument).toBeInTheDocument();
	});

	it('shows an error message when trying to generate a key having numbers', () => {
		renderDashboard();
		const descriptionInput = screen.getByLabelText('Description For API Key');
		fireEvent.change(descriptionInput, {target: {value: 'Test API 1222'}});
		const generateButton = screen.getByText('Generate Key');
		fireEvent.click(generateButton);
		const errordocument = screen.getByText(
			'Description must contain only alphabets and spaces',
		);
		expect(errordocument).toBeInTheDocument();
	});

	it('copies API key to clipboard', async () => {
		global.navigator.clipboard = {
			writeText: jest.fn(),
		};
		renderDashboard();
		const descriptionInput = screen.getByLabelText('Description For API Key');
		fireEvent.change(descriptionInput, {target: {value: 'Test API Key'}});
		const generateButton = screen.getByText('Generate Key');
		fireEvent.click(generateButton);
		const buttons = screen.getAllByTestId('api-key-copy');
		fireEvent.click(buttons[0]);
		const inscreenirem = await screen.findByTestId('api-key-copied');
		expect(inscreenirem).toBeInTheDocument();
	});
});
