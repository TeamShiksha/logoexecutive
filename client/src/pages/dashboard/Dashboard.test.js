import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import Dashboard from './Dashboard';
import {UserContext} from '../../contexts/UserContext';
import {formatDate} from '../../utils/helpers';

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
				updatedAt: formatDate(),
				createdAt: formatDate(),
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
	const renderDashboard = (userData = mockUserData) => {
		render(
			<UserContext.Provider value={{userData, fetchUserData}}>
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

	it('Delete API key and removes it from the list', async () => {
		renderDashboard();
		const deleteButton = screen.getAllByTestId('api-key-delete');
		const deletedApiKeyDescription = screen.queryByText('Demo Key');
		fireEvent.click(deleteButton[0]);
		await waitFor(() => {
			expect(deletedApiKeyDescription).not.toBeInTheDocument();
		});
	});

	it('Delete API Key fails on wrong keyId', async () => {
		const wrongKeyData = {
			firstName: 'Anoop',
			lastName: 'Singh',
			email: 'aps08@gmail.com',
			userId: '99234290-a33b-40d1-a5d4-888e86d06cd1',
			userType: 'CUSTOMER',
			keys: [
				{
					keyId: 'LogoExecutive@007',
					key: '4d6544e38f5d4ad8bae546ea61e2b842',
					usageCount: '0',
					keyDescription: 'Demo Key',
					updatedAt: formatDate(),
					createdAt: formatDate(),
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
		renderDashboard(wrongKeyData);
		const deleteButton = screen.getAllByTestId('api-key-delete');
		const deletedApiKeyDescription = screen.queryByText('Demo Key');
		fireEvent.click(deleteButton[0]);
		await waitFor(() => {
			expect(screen.getByText('Key ID is required')).toBeInTheDocument();
		});
		expect(deletedApiKeyDescription).toBeInTheDocument();
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
		expect(screen.getAllByText(formatDate())).toHaveLength(2);
		expect(descriptionInput).toHaveValue('');
	});

	it('checks if no keys are displayed when there are no keys', async () => {
		const mockNullData = {
			firstName: 'Aasish',
			lastName: 'M',
			email: 'aasishnilambur@gmail.com',
			userId: '99234290-a33b-40d1-a5d4-888e86d06cd1',
			userType: 'CUSTOMER',
			keys: null,
			subscription: {
				subscriptionId: '4d6544e3-8f5d-4ad8-bae5-46ea61e2b842',
				subscriptionType: 'HOBBY',
				keyLimit: 2,
				usageLimit: 400,
				isActive: false,
				createdAt: '2024-04-11T10:24:38.501Z',
				updatedAt: '2024-04-11T10:24:38.501Z',
			},
		};
		renderDashboard(mockNullData);
		await waitFor(() => {
			expect(fetchUserData).toHaveBeenCalled();
		});
		expect(
			screen.getByText(
				'Your api keys will be visible here, click on generate key to add new api key',
			),
		).toBeInTheDocument();
		const tableElement = screen.getByRole('table');
		const keyRows = screen.queryAllByRole('row', {container: tableElement});
		expect(keyRows).toHaveLength(2);
	});

	it('Check if used calls and total calls are being rendered', () => {
		const mockNullData = {
			firstName: 'Aasish',
			lastName: 'M',
			email: 'aasishnilambur@gmail.com',
			userId: '99234290-a33b-40d1-a5d4-888e86d06cd1',
			userType: 'CUSTOMER',
			keys: null,
			subscription: {
				subscriptionId: '4d6544e3-8f5d-4ad8-bae5-46ea61e2b842',
				subscriptionType: 'HOBBY',
				keyLimit: 2,
				usageLimit: 0,
				isActive: false,
				createdAt: '2024-04-11T10:24:38.501Z',
				updatedAt: '2024-04-11T10:24:38.501Z',
			},
		};
		renderDashboard(mockNullData);
		const zeroCalls = screen.getAllByText('0 calls');
		expect(zeroCalls).toHaveLength(2);
	});

	it('Throws error when same key description is given again', async () => {
		renderDashboard();
		const descriptionInput = screen.getByLabelText('Description For API Key');
		fireEvent.change(descriptionInput, {target: {value: 'Test API Key'}});
		const generateButton = screen.getByText('Generate Key');
		fireEvent.click(generateButton);
		await waitFor(() => {
			expect(
				screen.getByText('Please provide a different key description'),
			).toBeInTheDocument();
		});
	});

	it('Throws limit error for keys more than 2', async () => {
		renderDashboard();
		const descriptionInput = screen.getByLabelText('Description For API Key');
		fireEvent.change(descriptionInput, {target: {value: 'Test API Key'}});
		const generateButton = screen.getByText('Generate Key');
		fireEvent.click(generateButton);
		await waitFor(() => {
			expect(
				screen.getByText('Limit reached. Consider upgrading your plan'),
			).toBeInTheDocument();
		});
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
