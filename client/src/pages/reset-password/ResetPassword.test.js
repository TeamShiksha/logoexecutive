import React from 'react';
import {render, fireEvent, waitFor, screen} from '@testing-library/react';
import {BrowserRouter} from 'react-router-dom';
import ResetPassword from './ResetPassword';

describe('ResetPassword component', () => {
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
				screen.getByText(
					"Passwords don't match! Please double-check and re-enter them.",
				),
			).toBeInTheDocument();
		});
	});

	it('submits form successfully if passwords match', async () => {
		render(
			<BrowserRouter>
				<ResetPassword />
			</BrowserRouter>,
		);
		fireEvent.change(screen.getByLabelText('New Password'), {
			target: {value: 'password123'},
		});
		fireEvent.change(screen.getByLabelText('Confirm Password'), {
			target: {value: 'password123'},
		});
		fireEvent.click(screen.getByRole('button', {name: 'Submit'}));
		await waitFor(() => {
			expect(screen.getByText('Password Reset Successful')).toBeInTheDocument();
		});
	});
});
