import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import {useApi} from '../../hooks/useApi';
import ResetPassword from './ResetPassword';

jest.mock('../../hooks/useApi');

describe('Reset Password Component', () => {
	beforeEach(() => {
		useApi.mockReturnValue({
			data: {},
			makeRequest: jest.fn().mockResolvedValue(true),
			loading: false,
			errorMsg: '',
		});
	});

	it('renders the ResetPassword form correctly', () => {
		render(<ResetPassword />, {wrapper: MemoryRouter});
		expect(screen.getByText('Reset Password')).toBeInTheDocument();
		expect(screen.getByLabelText('New Password')).toBeInTheDocument();
		expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
		expect(screen.getByRole('button', {name: 'Submit'})).toBeInTheDocument();
	});

	it('updates the password input value correctly', () => {
		render(<ResetPassword />, {wrapper: MemoryRouter});
		const passwordInput = screen.getByLabelText('New Password');
		const confirmPasswordInput = screen.getByLabelText('Confirm Password');
		fireEvent.change(passwordInput, {target: {value: 'testing@123'}});
		fireEvent.change(confirmPasswordInput, {target: {value: 'testing@123'}});
		expect(passwordInput).toHaveValue('testing@123');
		expect(confirmPasswordInput).toHaveValue('testing@123');
	});

	it('displays error message when passwords do not match', async () => {
		render(<ResetPassword />, {wrapper: MemoryRouter});
		fireEvent.change(screen.getByLabelText('New Password'), {
			target: {value: 'password123'},
		});
		fireEvent.change(screen.getByLabelText('Confirm Password'), {
			target: {value: 'differentpassword'},
		});
		fireEvent.click(screen.getByText('Submit'));
		await waitFor(() => {
			expect(
				screen.getByText(
					"Passwords don't match! Please double-check and re-enter them.",
				),
			).toBeInTheDocument();
		});
	});

	it('submits the form and change the password', async () => {
		render(<ResetPassword />, {wrapper: MemoryRouter});
		const passwordInput = screen.getByLabelText('New Password');
		const confirmPasswordInput = screen.getByLabelText('Confirm Password');
		fireEvent.change(passwordInput, {target: {value: 'testing@123'}});
		fireEvent.change(confirmPasswordInput, {target: {value: 'testing@123'}});
		const submitButton = screen.getByRole('button', {name: 'Submit'});
		fireEvent.click(submitButton);
		expect(useApi.mock.calls[0][0]).toEqual({
			url: 'api/auth/reset-password',
			method: 'patch',
			data: {newPassword: '', confirmPassword: '', token: null},
		});
		await waitFor(() => {
			expect(screen.getByRole('reset-success-alert')).toBeInTheDocument();
		});
	});
});
