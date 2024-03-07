import {render, fireEvent, waitFor, screen} from '@testing-library/react';
import DashboardContent from './DashboardContent';

describe('DashboardContent', () => {
	it('renders correctly', () => {
		render(<DashboardContent />);
		expect(screen.getByText('Generate your API key')).toBeInTheDocument();
	});

	it('generates a new API key when the form is submitted', async () => {
		render(<DashboardContent />);
		const input = screen.getByLabelText('Description for API Key');
		const button = screen.getByText('Generate Key');

		fireEvent.change(input, {target: {value: 'Test Key'}});
		fireEvent.click(button);

		await waitFor(() => {
			expect(screen.getByText('Test Key')).toBeInTheDocument();
		});
	});

	it('shows an error message when trying to generate a key without a description', () => {
		render(<DashboardContent />);
		const button = screen.getByText('Generate Key');

		fireEvent.click(button);

		expect(screen.getByText('Description cannot be empty')).toBeInTheDocument();
	});

	it('deletes API key when the delete button is clicked', async () => {
		render(<DashboardContent />);
		const deleteButton = screen.getAllByTestId('api-key-delete');

		fireEvent.click(deleteButton[0]);

		await waitFor(() => {
			expect(screen.queryByText('Demo Key 1')).not.toBeInTheDocument();
		});
	});

	it('renders the CurrentPlan component', () => {
		render(<DashboardContent />);
		expect(screen.getByText('Current Plan')).toBeInTheDocument();
	});

	it('renders the  Usage component', () => {
		render(<DashboardContent />);
		expect(screen.getByText('Usage')).toBeInTheDocument();
	});
});
