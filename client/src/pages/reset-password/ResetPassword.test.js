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

	// DO NOT DELETE, THIS TEST NEED TO BE ENABLED WITH MSW
	// it('submits form successfully if passwords match', async () => {
	// 	render(
	// 		<BrowserRouter>
	// 			<ResetPassword />
	// 		</BrowserRouter>,
	// 	);
	// 	fireEvent.change(screen.getByLabelText('New Password'), {
	// 		target: {value: 'password123'},
	// 	});
	// 	fireEvent.change(screen.getByLabelText('Confirm Password'), {
	// 		target: {value: 'password123'},
	// 	});
	// 	fireEvent.click(screen.getByRole('button', {name: 'Submit'}));
	// 	await waitFor(() => {
	// 		expect(screen.getByText('Password Reset Successful')).toBeInTheDocument();
	// 	});
	// });
});
