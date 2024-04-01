/* eslint-disable testing-library/no-unnecessary-act */
import {act, fireEvent, render, screen} from '@testing-library/react';
import {BrowserRouter} from 'react-router-dom';
import Signup from './Signup';
import {AuthContext} from '../../contexts/AuthContext';

describe('Signup', () => {
	const renderSignup = () => {
		render(
			<AuthContext.Provider value={false}>
				<BrowserRouter>
					<Signup />
				</BrowserRouter>
			</AuthContext.Provider>,
		);
	};
	it('should render Signup UI on Screen', () => {
		renderSignup();
		expect(screen.getByText('Sign up for free')).toBeInTheDocument();
		expect(screen.getByLabelText('First Name')).toBeInTheDocument();
		expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
		expect(screen.getByLabelText('Email')).toBeInTheDocument();
		expect(screen.getByLabelText('Password')).toBeInTheDocument();
		expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
		expect(screen.getByRole('button', {name: /Register/i})).toHaveClass(
			'submit-button',
		);
		expect(screen.getByText('Already have an account?')).toBeInTheDocument();
		expect(screen.getByText('Sign in')).toHaveClass('input-actiontext-link');
	});

	it.only('should register a user successfully', () => {
		renderSignup();
		const handleSubmitMock = () => jest.fn();

		const firstName = screen.getByLabelText('First Name');
		const lastName = screen.getByLabelText('Last Name');
		const email = screen.getByLabelText('Email');
		const password = screen.getByLabelText('Password');
		const confirmPassword = screen.getByLabelText('Confirm Password');
		const registerButton = screen.getByRole('button', {name: /Register/i});

		fireEvent.change(firstName, {target: {value: 'Jhon'}});
		fireEvent.change(lastName, {target: {value: 'Doe'}});
		fireEvent.change(email, {target: {value: 'jhonDoe@gmail.com'}});
		fireEvent.change(password, {target: {value: 'Abc@1234'}});
		fireEvent.change(confirmPassword, {target: {value: 'Abc@1234'}});
		act(() => {
			const form = screen.getByTestId('form');
			fireEvent.click(registerButton);
		});
		expect(handleSubmitMock).toHaveBeenCalled();
	});
});
