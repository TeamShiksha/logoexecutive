import React from 'react';
import {render, fireEvent, waitFor, screen} from '@testing-library/react';
import {BrowserRouter} from 'react-router-dom';
import ResetPassword from './ResetPassword';
import {useLocation, useNavigate} from 'react-router-dom';

jest.mock('react-router', () => ({
	...jest.requireActual('react-router'),
	useNavigate: jest.fn(),
	useLocation: jest.fn(),
}));

describe('ResetPassword component', () => {
	beforeEach(() => {
		useNavigate.mockReturnValue(jest.fn());
	});

	it('renders reset password form', () => {
		render(
			<BrowserRouter>
				<ResetPassword />
			</BrowserRouter>,
		);

		expect(screen.getByText('Reset Password')).toBeInTheDocument();
		expect(
			screen.getByText('Enter your new password below'),
		).toBeInTheDocument();
		expect(screen.getByLabelText('New Password')).toBeInTheDocument();
		expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
		expect(screen.getByRole('button', {name: 'Submit'})).toBeInTheDocument();
	});

	it('shows error message if passwords do not match', async () => {
		render(
			<BrowserRouter>
				<ResetPassword />
			</BrowserRouter>,
		);

		fireEvent.change(screen.getByLabelText('New Password'), {
			target: {value: 'password123'},
		});
		fireEvent.change(screen.getByLabelText('Confirm Password'), {
			target: {value: 'password456'},
		});
		fireEvent.click(screen.getByRole('button', {name: 'Submit'}));
		await waitFor(() => {
			expect(
				screen.getByText('Password and Confirm password do not match'),
			).toBeInTheDocument();
		});
	});

	it('Length less than 8', async () => {
		render(
			<BrowserRouter>
				<ResetPassword />
			</BrowserRouter>,
		);

		fireEvent.change(screen.getByLabelText('New Password'), {
			target: {value: '1234'},
		});
		fireEvent.change(screen.getByLabelText('Confirm Password'), {
			target: {value: '1234'},
		});
		fireEvent.click(screen.getByRole('button', {name: 'Submit'}));
		await waitFor(() => {
			expect(
				screen.getByText('Password must be at least 8 characters'),
			).toBeInTheDocument();
		});
	});

	it('Length greater than 30', async () => {
		render(
			<BrowserRouter>
				<ResetPassword />
			</BrowserRouter>,
		);

		fireEvent.change(screen.getByLabelText('New Password'), {
			target: {value: 'SOmelongpassw0rDGreAter6Than30CharcateersLong'},
		});
		fireEvent.change(screen.getByLabelText('Confirm Password'), {
			target: {value: 'SOmelongpassw0rDGreAter6Than30CharcateersLong'},
		});
		fireEvent.click(screen.getByRole('button', {name: 'Submit'}));
		await waitFor(() => {
			expect(
				screen.getByText('Password must be 30 characters or fewer'),
			).toBeInTheDocument();
		});
	});

	it('navigates to /home when token is not provided', () => {
		useLocation.mockReturnValue({search: ''});
		const navigate = useNavigate();
		render(
			<BrowserRouter>
				<ResetPassword />
			</BrowserRouter>,
		);

		expect(navigate).toHaveBeenCalledWith('/home');
	});

	it('submits form successfully if passwords match', async () => {
		useLocation.mockReturnValue({search: '?token=123'});
		render(
			<BrowserRouter>
				<ResetPassword />
			</BrowserRouter>,
		);

		fireEvent.change(screen.getByLabelText('New Password'), {
			target: {value: '123456789'},
		});
		fireEvent.change(screen.getByLabelText('Confirm Password'), {
			target: {value: '123456789'},
		});
		fireEvent.click(screen.getByRole('button', {name: 'Submit'}));

		await waitFor(() => {
			expect(
				screen.getByText(
					'Your password has been successfully reset. You can now sign in with your new password.',
				),
			).toBeInTheDocument();
		});
	});

	it('displays an error message for invalid token', async () => {
		render(
			<BrowserRouter>
				<ResetPassword />
			</BrowserRouter>,
		);

		fireEvent.change(screen.getByLabelText('New Password'), {
			target: {value: 'password@123'},
		});
		fireEvent.change(screen.getByLabelText('Confirm Password'), {
			target: {value: 'password@123'},
		});
		fireEvent.click(screen.getByRole('button', {name: 'Submit'}));
		await waitFor(() => {
			expect(screen.getByText('Internal Server Error')).toBeInTheDocument();
		});
	});
});
