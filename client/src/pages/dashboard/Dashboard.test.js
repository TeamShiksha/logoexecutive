import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import {Dashboard} from './Dashboard';

describe('Dashboard Component', () => {
	it('renders Dashboard with all its components', () => {
		render(<Dashboard />);
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
	it('generates API key and adds to the list', () => {
		render(<Dashboard />);
		const descriptionInput = screen.getByLabelText('Description For API Key');
		fireEvent.change(descriptionInput, {target: {value: 'Test API Key'}});
		const generateButton = screen.getByText('Generate Key');
		fireEvent.click(generateButton);
		const apiKeyDescription = screen.getByText('Test API Key');
		expect(apiKeyDescription).toBeInTheDocument();
	});
	it('Delete API key and remove from the list', () => {
		render(<Dashboard />);
		const deleteButton = screen.getAllByTestId('api-key-delete');
		fireEvent.click(deleteButton[0]);
		const deletedApiKeyDescription = screen.queryByText('Demo Key 1');
		expect(deletedApiKeyDescription).not.toBeInTheDocument();
	});
	it('shows an error message when trying to generate a key without a description', async () => {
		render(<Dashboard />);
		const button = screen.getByText('Generate Key');
		fireEvent.click(button);
		const errordocument = screen.getByText('Description cannot be empty');
		expect(errordocument).toBeInTheDocument();
	});

	it('shows an error message when trying to generate a key greater than 12 characters', () => {
		render(<Dashboard />);
		const descriptionInput = screen.getByLabelText('Description For API Key');
		fireEvent.change(descriptionInput, {target: {value: 'Test API Key'}});
		const generateButton = screen.getByText('Generate Key');
		fireEvent.click(generateButton);
		const errordocument = screen.getByText('Description cannot be more than 12 characters');
		expect(errordocument).toBeInTheDocument();
	});

	it('shows an error message when trying to generate a key having numbers', () => {
		render(<Dashboard />);
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
		render(<Dashboard />);
		const buttons = screen.getAllByTestId('api-key-copy');
		fireEvent.click(buttons[0]);
		const inscreenirem = await screen.findByTestId('api-key-copied');
		expect(inscreenirem).toBeInTheDocument();
	});
});
