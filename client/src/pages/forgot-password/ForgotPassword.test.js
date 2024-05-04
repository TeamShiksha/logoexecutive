import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import ForgotPassword from './ForgotPassword';

describe('ForgotPassword Component', () => {
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

	it('navigates to sign in page when "Go back to sign in" link is clicked', () => {
		const {container} = render(<ForgotPassword />, {wrapper: MemoryRouter});
		const signInLink = screen.getByRole('link', {name: 'Go back to sign in'});
		fireEvent.click(signInLink);
		expect(container.innerHTML).toContain('/signin');
	});

	it('displays error when email is empty', async () => {
		render(<ForgotPassword />, {wrapper: MemoryRouter});
		const emailInput = screen.getByLabelText('Enter Your Email');
		const submitButton = screen.getByRole('button', {name: 'Submit'});
		fireEvent.change(emailInput, {target: {value: ''}});
		fireEvent.click(submitButton);
		await waitFor(() => {
			expect(
				screen.getByText('Please enter your email address'),
			).toBeInTheDocument();
		});
	});

	it('displays validation error when email is invalid', async () => {
		render(<ForgotPassword />, {wrapper: MemoryRouter});
		const emailInput = screen.getByLabelText('Enter Your Email');
		const submitButton = screen.getByRole('button', {name: 'Submit'});
		fireEvent.change(emailInput, {target: {value: 'invalid email'}});
		fireEvent.click(submitButton);
		await waitFor(() => {
			expect(
				screen.getByText('Please enter a valid email address'),
			).toBeInTheDocument();
		});
	});

	it('displays success message when form is submitted with valid email', async () => {
		render(<ForgotPassword />, {wrapper: MemoryRouter});
		const emailInput = screen.getByLabelText('Enter Your Email');
		const submitButton = screen.getByRole('button', {name: 'Submit'});
		fireEvent.change(emailInput, {target: {value: 'test@example.com'}});
		fireEvent.click(submitButton);
		await waitFor(() => {
			expect(
				screen.getByText('Password reset link sent to your email'),
			).toBeInTheDocument();
		});
	});
});
