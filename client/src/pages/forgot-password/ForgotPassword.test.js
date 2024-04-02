import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import ForgotPassword from './ForgotPassword';
import {useApi} from '../../hooks/useApi';

jest.mock('../../hooks/useApi');

describe('ForgotPassword Component', () => {
	beforeEach(() => {
		useApi.mockReturnValue({
			data: {},
			makeRequest: jest.fn().mockResolvedValue(true),
			loading: false,
			errorMsg: '',
		});
	});

	it('renders the ForgotPassword form correctly', () => {
		render(<ForgotPassword />, {wrapper: MemoryRouter});
		expect(screen.getByText('Forgot Password')).toBeInTheDocument();
		expect(screen.getByLabelText('Enter Your Email')).toBeInTheDocument();
		expect(screen.getByRole('button', {name: 'Submit'})).toBeInTheDocument();
		expect(
			screen.getByRole('link', {name: 'Go back to sign in'}),
		).toBeInTheDocument();
	});

	it('updates the email input value correctly', () => {
		render(<ForgotPassword />, {wrapper: MemoryRouter});
		const emailInput = screen.getByLabelText('Enter Your Email');
		fireEvent.change(emailInput, {target: {value: 'test@example.com'}});
		expect(emailInput).toHaveValue('test@example.com');
	});

	it('submits the form and displays success message', async () => {
		render(<ForgotPassword />, {wrapper: MemoryRouter});
		const emailInput = screen.getByLabelText('Enter Your Email');
		const submitButton = screen.getByRole('button', {name: 'Submit'});
		fireEvent.change(emailInput, {target: {value: 'test@example.com'}});
		fireEvent.click(submitButton);
		expect(useApi.mock.calls[0][0]).toEqual({
			url: 'api/auth/forgot-password',
			method: 'post',
			data: {email: ''},
		});
		await waitFor(() => {
			expect(screen.getByRole('alert')).toBeInTheDocument();
		});
	});

	it('navigates to sign in page when "Go back to sign in" link is clicked', () => {
		const {container} = render(<ForgotPassword />, {wrapper: MemoryRouter});
		const signInLink = screen.getByRole('link', {name: 'Go back to sign in'});
		fireEvent.click(signInLink);
		expect(container.innerHTML).toContain('/signin');
	});
});
