import React from 'react';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {BrowserRouter, useNavigate} from 'react-router-dom';
import {AuthContext} from '../../contexts/AuthContext';
import Signincard from './Signincard';

jest.mock('react-router', () => ({
	...jest.requireActual('react-router'),
	useNavigate: jest.fn(),
}));

describe('Sign In Card Component', () => {
	const mockSetUser = jest.fn();

	const renderComponent = () => {
		render(
			<AuthContext.Provider
				value={{
					isAuthenticated: false,
					setIsAuthenticated: mockSetUser,
				}}
			>
				<BrowserRouter>
					<Signincard />
				</BrowserRouter>
			</AuthContext.Provider>,
		);
	};

	const changeInputValue = (inputElement, value) => {
		fireEvent.change(inputElement, {target: {value}});
	};

	beforeEach(() => {
		useNavigate.mockReturnValue(jest.fn());
	});

	test('Sign in card should be rendered properly with the proper form', () => {
		renderComponent();
		const emailInputElement = screen.getByLabelText('email');
		const passwordInputElement = screen.getByLabelText('password');
		const buttonElement = screen.getByLabelText('Sign in to Dashboard');
		expect(screen.getByText('Sign in to dashboard')).toBeInTheDocument();
		expect(emailInputElement).toBeInTheDocument();
		expect(passwordInputElement).toBeInTheDocument();
		expect(buttonElement).toBeInTheDocument();
	});

	test('Input value change should be handled', () => {
		renderComponent();
		const emailInputElement = screen.getByLabelText('email');
		const passwordInputElement = screen.getByLabelText('password');
		changeInputValue(emailInputElement, 'bill@gmail.com');
		expect(emailInputElement.value).toBe('bill@gmail.com');
		changeInputValue(passwordInputElement, 'p@$$W0rD');
		expect(passwordInputElement.value).toBe('p@$$W0rD');
	});

	test('Improper email format should throw error', () => {
		renderComponent();
		const emailInputElement = screen.getByLabelText('email');
		const buttonElement = screen.getByLabelText('Sign in to Dashboard');
		const alertElement = screen.getByRole('alert');
		changeInputValue(emailInputElement, 'bill@gaf');
		expect(emailInputElement.value).toBe('bill@gaf');
		expect(alertElement).toHaveClass('hidden');
		fireEvent.click(buttonElement);
		expect(alertElement).not.toHaveClass('hidden');
		expect(alertElement).toHaveTextContent('Invalid email format');
	});

	test('Empty email address should throw error', () => {
		renderComponent();
		const emailInputElement = screen.getByLabelText('email');
		const buttonElement = screen.getByLabelText('Sign in to Dashboard');
		const alertElement = screen.getByRole('alert');
		changeInputValue(emailInputElement, '');
		expect(emailInputElement.value).toBe('');
		expect(alertElement).toHaveClass('hidden');
		fireEvent.click(buttonElement);
		expect(alertElement).not.toHaveClass('hidden');
		expect(alertElement).toHaveTextContent('Email is required');
	});

	test('Long email address should throw error', () => {
		renderComponent();
		const emailInputElement = screen.getByLabelText('email');
		const buttonElement = screen.getByLabelText('Sign in to Dashboard');
		const alertElement = screen.getByRole('alert');
		changeInputValue(emailInputElement, 'a'.repeat(51));
		expect(emailInputElement.value).toBe('a'.repeat(51));
		expect(alertElement).toHaveClass('hidden');
		fireEvent.click(buttonElement);
		expect(alertElement).not.toHaveClass('hidden');
		expect(alertElement).toHaveTextContent(
			'Email should not be more than 50 characters long',
		);
	});

	test('Empty password should throw error', () => {
		renderComponent();
		const emailInputElement = screen.getByLabelText('email');
		const passwordInputElement = screen.getByLabelText('password');
		const buttonElement = screen.getByLabelText('Sign in to Dashboard');
		const alertElement = screen.getByRole('alert');
		changeInputValue(emailInputElement, 'bill@gmail.com');
		changeInputValue(passwordInputElement, '');
		expect(passwordInputElement.value).toBe('');
		expect(alertElement).toHaveClass('hidden');
		fireEvent.click(buttonElement);
		expect(alertElement).not.toHaveClass('hidden');
		expect(alertElement).toHaveTextContent('Password is required');
	});

	test('Short password should throw error', () => {
		renderComponent();
		const emailInputElement = screen.getByLabelText('email');
		const passwordInputElement = screen.getByLabelText('password');
		const buttonElement = screen.getByLabelText('Sign in to Dashboard');
		const alertElement = screen.getByRole('alert');
		changeInputValue(emailInputElement, 'bill@gmail.com');
		changeInputValue(passwordInputElement, 'short');
		expect(passwordInputElement.value).toBe('short');
		expect(alertElement).toHaveClass('hidden');
		fireEvent.click(buttonElement);
		expect(alertElement).not.toHaveClass('hidden');
		expect(alertElement).toHaveTextContent(
			'Password should be 8 to 30 characters long',
		);
	});

	test('Invalid password should throw error', () => {
		renderComponent();
		const emailInputElement = screen.getByLabelText('email');
		const passwordInputElement = screen.getByLabelText('password');
		const buttonElement = screen.getByLabelText('Sign in to Dashboard');
		const alertElement = screen.getByRole('alert');
		changeInputValue(emailInputElement, 'bill@gmail.com');
		changeInputValue(passwordInputElement, 'password');
		expect(passwordInputElement.value).toBe('password');
		expect(alertElement).toHaveClass('hidden');
		fireEvent.click(buttonElement);
		expect(alertElement).not.toHaveClass('hidden');
		expect(alertElement).toHaveTextContent(
			'Password should contain at least one uppercase letter, one lowercase letter, one digit, and one special character',
		);
	});

	test('Successful request should reset form, authenticate user, and navigate', async () => {
		renderComponent();
		const emailInputElement = screen.getByLabelText('email');
		const passwordInputElement = screen.getByLabelText('password');
		const buttonElement = screen.getByLabelText('Sign in to Dashboard');
		const alertElement = screen.getByRole('alert');
		changeInputValue(emailInputElement, 'bill@gmail.com');
		changeInputValue(passwordInputElement, 'p@$$W0rD');
		expect(emailInputElement.value).toBe('bill@gmail.com');
		expect(passwordInputElement.value).toBe('p@$$W0rD');
		expect(alertElement).toHaveClass('hidden');

		fireEvent.click(buttonElement);

		await waitFor(() => {
			expect(emailInputElement.value).toBe('');
		});
		await waitFor(() => {
			expect(passwordInputElement.value).toBe('');
		});
		await waitFor(() => {
			expect(mockSetUser).toHaveBeenCalledWith(true);
		});
		const navigate = useNavigate();
		expect(navigate).toHaveBeenCalledWith('/dashboard');
	});

	test('Incorrect email or password should throw error', async () => {
		renderComponent();
		const emailInputElement = screen.getByLabelText('email');
		const passwordInputElement = screen.getByLabelText('password');
		const buttonElement = screen.getByLabelText('Sign in to Dashboard');
		const alertElement = screen.getByRole('alert');
		changeInputValue(emailInputElement, 'bill@gmail.com');
		changeInputValue(passwordInputElement, 'Bill7@gmail.com');
		expect(passwordInputElement.value).toBe('Bill7@gmail.com');
		expect(alertElement).toHaveClass('hidden');

		fireEvent.click(buttonElement);

		await waitFor(() => {
			expect(alertElement).toHaveTextContent('Incorrect email or password.');
		});
	});

	test('Unverified email should throw error', async () => {
		renderComponent();
		const emailInputElement = screen.getByLabelText('email');
		const passwordInputElement = screen.getByLabelText('password');
		const buttonElement = screen.getByLabelText('Sign in to Dashboard');
		const alertElement = screen.getByRole('alert');
		changeInputValue(emailInputElement, 'unverified@gmail.com');
		changeInputValue(passwordInputElement, 'p@$$W0rD');
		expect(emailInputElement.value).toBe('unverified@gmail.com');
		expect(passwordInputElement.value).toBe('p@$$W0rD');
		expect(alertElement).toHaveClass('hidden');

		fireEvent.click(buttonElement);

		await waitFor(() => {
			expect(alertElement).toHaveTextContent('Email not verified');
		});
	});
});
