import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {BrowserRouter} from 'react-router-dom';
import {AuthContext} from '../../contexts/AuthContext';
import {rest} from 'msw';
import {server} from '../../mocks/server';
import Settings from './Settings';

describe('Settings component', () => {
	const mockLogout = jest.fn();
	const renderSettings = () => {
		render(
			<AuthContext.Provider value={{isAuthenticated: true, logout: mockLogout}}>
				<BrowserRouter>
					<Settings />
				</BrowserRouter>
			</AuthContext.Provider>,
		);
	};

	test('renders settings component', () => {
		renderSettings();
		const headingElement = screen.getByText(/Settings/i);
		expect(headingElement).toBeInTheDocument();
		const downloadButton = screen.getByText(/Download Account Data/i);
		expect(downloadButton).toBeInTheDocument();
		expect(downloadButton).toBeDisabled();
		const deleteButton = screen.getByText(/Delete Account/i);
		expect(deleteButton).toBeInTheDocument();
	});

	test('opens modal when delete button is clicked', () => {
		renderSettings();
		const modalElement = screen.queryByText(/Are you sure?/i);
		expect(modalElement).not.toBeInTheDocument();
		const deleteButton = screen.getByRole('button', {name: 'Delete Account'});
		fireEvent.click(deleteButton);
		const modalTitle = screen.getByText(/Are you sure?/i);
		expect(modalTitle).toBeInTheDocument();
	});

	test('deletes account and navigates to home page on successful API call', async () => {
		renderSettings();
		const deleteButton = screen.getByRole('button', {name: 'Delete Account'});
		fireEvent.click(deleteButton);
		const confirmButton = screen.getByRole('button', {name: 'Okay'});
		fireEvent.click(confirmButton);

		await waitFor(() => {
			const successMessage = screen.getByText(
				'Your user data has been successfully deleted from our system',
			);
			expect(successMessage).toBeInTheDocument();
		});

		await waitFor(
			() => {
				expect(mockLogout).toHaveBeenCalled();
			},
			{timeout: 4000},
		);
	});

	test('shows error modal on failed API call', async () => {
		server.use(
			rest.delete(
				`${process.env.REACT_APP_PROXY_URL}/api/user/delete`,
				(req, res, ctx) => {
					return res(
						ctx.status(500),
						ctx.json({message: 'Something went wrong'}),
					);
				},
			),
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
			expect(errorModal).toBeInTheDocument();
		});
	});
});
