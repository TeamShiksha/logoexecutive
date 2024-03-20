import React from 'react';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import Signincard from './Signincard';
import * as router from 'react-router';
import {BrowserRouter} from 'react-router-dom';
import {AuthContext} from '../../contexts/AuthContext';

describe('Sign In Card Component', () => {
	const mockSetUser = jest.fn();

	const renderSignincard = (isAuthenticated) => {
		render(
			<AuthContext.Provider
				value={{
					isAuthenticated,
					setIsAuthenticated: mockSetUser,
				}}
			>
				<BrowserRouter>
					<Signincard />
				</BrowserRouter>
			</AuthContext.Provider>,
		);
	};

	test('Sign in card should be rendered properly with the proper form', () => {
		renderSignincard(false);
		const emailInputElement = screen.getByLabelText('email');
		const passwordInputElement = screen.getByLabelText('password');
		const buttonElement = screen.getByLabelText('Sign in to Dashboard');
		expect(screen.getByText('Sign in to dashboard')).toBeInTheDocument();
		expect(emailInputElement).toBeInTheDocument();
		expect(passwordInputElement).toBeInTheDocument();
		expect(buttonElement).toBeInTheDocument();
	});

	test('Input value change should be handled', () => {
		renderSignincard(false);
		const emailInputElement = screen.getByLabelText('email');
		const passwordInputElement = screen.getByLabelText('password');
		fireEvent.change(emailInputElement, {
			target: {value: 'bill@gmail.com'},
		});
		expect(emailInputElement.value).toBe('bill@gmail.com');
		fireEvent.change(passwordInputElement, {
			target: {value: 'p@$$W0rD'},
		});
		expect(passwordInputElement.value).toBe('p@$$W0rD');
	});

	test('Inproper email address should throw error', () => {
		renderSignincard(false);
		const emailInputElement = screen.getByLabelText('email');
		const buttonElement = screen.getByLabelText('Sign in to Dashboard');
		fireEvent.change(emailInputElement, {
			target: {value: 'bill@gaf'},
		});
		expect(emailInputElement.value).toBe('bill@gaf');
		const alertElement = screen.getByRole('alert');
		expect(alertElement).toBeInTheDocument();
		expect(alertElement).toHaveClass('hidden');
		fireEvent.click(buttonElement);
		expect(alertElement).toBeInTheDocument();
		expect(alertElement).not.toHaveClass('hidden');
		expect(alertElement).toHaveTextContent(
			'Please enter a valid email address',
		);
	});
});
