import {describe, it, expect, vi, beforeAll, afterEach, afterAll} from 'vitest';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {BrowserRouter} from 'react-router-dom';
import {AuthContext} from '../../contexts/AuthContext';
import {rest} from 'msw';
import {server} from '../../mocks/server';
import Settings from './Settings';

describe('Settings component', () => {
	const mockLogout = vi.fn();
	const renderSettings = () => {
		render(
			<AuthContext.Provider value={{isAuthenticated: true, logout: mockLogout}}>
				<BrowserRouter>
					<Settings />
				</BrowserRouter>
			</AuthContext.Provider>,
		);
	};

	beforeAll(() => server.listen());
	afterEach(() => server.resetHandlers());
	afterAll(() => server.close());

	it('renders settings component', () => {
		renderSettings();
		const headingElement = screen.getByText(/Settings/i);
		expect(headingElement).toBeDefined();
		const downloadButton = screen.getByText(/Download Account Data/i);
		expect(downloadButton).toBeDefined();
		expect(downloadButton).toBeDisabled();
		const deleteButton = screen.getByText(/Delete Account/i);
		expect(deleteButton).toBeDefined();
	});

	it('opens modal when delete button is clicked', () => {
		renderSettings();
		const modalElement = screen.queryByText(/Are you sure?/i);
		expect(modalElement).toBeNull();
		const deleteButton = screen.getByRole('button', {name: 'Delete Account'});
		fireEvent.click(deleteButton);
		const modalTitle = screen.getByText(/Are you sure?/i);
		expect(modalTitle).toBeDefined();
	});

	it('deletes account and navigates to home page on successful API call', async () => {
		renderSettings();
		const deleteButton = screen.getByRole('button', {name: 'Delete Account'});
		fireEvent.click(deleteButton);
		const confirmButton = screen.getByRole('button', {name: 'Okay'});
		fireEvent.click(confirmButton);

		await waitFor(() => {
			const successMessage = screen.getByText(
				'Your user data has been successfully deleted from our system',
			);
			expect(successMessage).toBeDefined();
		});

		await waitFor(
			() => {
				expect(mockLogout).toHaveBeenCalled();
			},
			{timeout: 4000},
		);
	});

	it('shows error modal on failed API call', async () => {
		server.use(
			rest.delete('/api/user/delete', (req, res, ctx) => {
				return res(
					ctx.status(500),
					ctx.json({message: 'Something went wrong'}),
				);
			}),
		);

		renderSettings();
		const deleteButton = screen.getByRole('button', {name: 'Delete Account'});
		fireEvent.click(deleteButton);
		const confirmButton = screen.getByRole('button', {name: 'Okay'});
		fireEvent.click(confirmButton);

		await waitFor(() => {
			const errorModal = screen.getByText(
				'Something went wrong. Please try again later.',
			);
			expect(errorModal).toBeDefined();
		});
	});
});
