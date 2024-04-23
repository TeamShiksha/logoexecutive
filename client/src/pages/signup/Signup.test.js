import {waitFor, fireEvent, render, screen} from '@testing-library/react';
import {BrowserRouter, Navigate} from 'react-router-dom';
import Signup from './Signup';
import {AuthContext} from '../../contexts/AuthContext';

jest.mock('react-router-dom', () => ({
	...jest.requireActual('react-router-dom'),
	Navigate: jest.fn(() => null),
}));

describe('Signup', () => {
	const renderSignup = (isAuthenticated) => {
		render(
			<AuthContext.Provider value={{isAuthenticated}}>
				<BrowserRouter>
					<Signup />
				</BrowserRouter>
			</AuthContext.Provider>,
		);
	};
	it('should render Signup UI on Screen', () => {
		renderSignup(false);
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

	it('should throw an error if first name is missing', () => {
		renderSignup(false);

		const firstName = screen.getByLabelText('First Name');
		const lastName = screen.getByLabelText('Last Name');
		const email = screen.getByLabelText('Email');
		const password = screen.getByLabelText('Password');
		const confirmPassword = screen.getByLabelText('Confirm Password');
		const registerButton = screen.getByRole('button', {name: /Register/i});

		fireEvent.change(firstName, {target: {value: ''}});
		fireEvent.change(lastName, {target: {value: ''}});
		fireEvent.change(email, {target: {value: ''}});
		fireEvent.change(password, {target: {value: ''}});
		fireEvent.change(confirmPassword, {target: {value: ''}});
		fireEvent.click(registerButton);

		expect(screen.getByText('First name is required')).toHaveClass(
			'input-error',
		);
	});

	it('should throw an error if last name is missing', () => {
		renderSignup(false);

		const firstName = screen.getByLabelText('First Name');
		const lastName = screen.getByLabelText('Last Name');
		const email = screen.getByLabelText('Email');
		const password = screen.getByLabelText('Password');
		const confirmPassword = screen.getByLabelText('Confirm Password');
		const registerButton = screen.getByRole('button', {name: /Register/i});

		fireEvent.change(firstName, {target: {value: 'dummy'}});
		fireEvent.change(lastName, {target: {value: ''}});
		fireEvent.change(email, {target: {value: ''}});
		fireEvent.change(password, {target: {value: ''}});
		fireEvent.change(confirmPassword, {target: {value: ''}});
		fireEvent.click(registerButton);

		expect(screen.getByText('Last name is required')).toHaveClass(
			'input-error',
		);
	});

	it('should throw an error if email is missing', () => {
		renderSignup(false);

		const firstName = screen.getByLabelText('First Name');
		const lastName = screen.getByLabelText('Last Name');
		const email = screen.getByLabelText('Email');
		const password = screen.getByLabelText('Password');
		const confirmPassword = screen.getByLabelText('Confirm Password');
		const registerButton = screen.getByRole('button', {name: /Register/i});

		fireEvent.change(firstName, {target: {value: 'dummy'}});
		fireEvent.change(lastName, {target: {value: 'dummy'}});
		fireEvent.change(email, {target: {value: ''}});
		fireEvent.change(password, {target: {value: ''}});
		fireEvent.change(confirmPassword, {target: {value: ''}});
		fireEvent.click(registerButton);

		expect(screen.getByText('Email is required')).toHaveClass('input-error');
	});

	it('should throw an error if password is missing', () => {
		renderSignup(false);

		const firstName = screen.getByLabelText('First Name');
		const lastName = screen.getByLabelText('Last Name');
		const email = screen.getByLabelText('Email');
		const password = screen.getByLabelText('Password');
		const confirmPassword = screen.getByLabelText('Confirm Password');
		const registerButton = screen.getByRole('button', {name: /Register/i});

		fireEvent.change(firstName, {target: {value: 'dummy'}});
		fireEvent.change(lastName, {target: {value: 'dummy'}});
		fireEvent.change(email, {target: {value: 'dummy@gmail.com'}});
		fireEvent.change(password, {target: {value: ''}});
		fireEvent.change(confirmPassword, {target: {value: ''}});
		fireEvent.click(registerButton);

		expect(screen.getByText('Password is required')).toHaveClass('input-error');
	});

	it("should throw an error if the user's first name does not have correct length value", () => {
		renderSignup(false);

		const firstName = screen.getByLabelText('First Name');
		const lastName = screen.getByLabelText('Last Name');
		const email = screen.getByLabelText('Email');
		const password = screen.getByLabelText('Password');
		const confirmPassword = screen.getByLabelText('Confirm Password');
		const registerButton = screen.getByRole('button', {name: /Register/i});

		fireEvent.change(firstName, {target: {value: 'loremIpsumissimplydummy'}});
		fireEvent.change(lastName, {target: {value: 'loremIpsumissimplydummy'}});
		fireEvent.change(email, {
			target: {value: 'johniseatiingalotoffoodthesedaysproperlyhh@gmail.com'},
		});
		fireEvent.change(password, {target: {value: 'abc'}});
		fireEvent.change(confirmPassword, {target: {value: 'abc'}});
		fireEvent.click(registerButton);

		expect(
			screen.getByText('First name should be 1 to 20 characters long'),
		).toHaveClass('input-error');
	});

	it("should throw an error if the user's last name does not have correct length value", () => {
		renderSignup(false);

		const firstName = screen.getByLabelText('First Name');
		const lastName = screen.getByLabelText('Last Name');
		const email = screen.getByLabelText('Email');
		const password = screen.getByLabelText('Password');
		const confirmPassword = screen.getByLabelText('Confirm Password');
		const registerButton = screen.getByRole('button', {name: /Register/i});

		fireEvent.change(firstName, {target: {value: 'dummy'}});
		fireEvent.change(lastName, {target: {value: 'loremIpsumissimplydummy'}});
		fireEvent.change(email, {
			target: {value: 'johniseatiingalotoffoodthesedaysproperlyhh@gmail.com'},
		});
		fireEvent.change(password, {target: {value: 'abc'}});
		fireEvent.change(confirmPassword, {target: {value: 'abc'}});
		fireEvent.click(registerButton);

		expect(
			screen.getByText('Last name should be 1 to 20 characters long'),
		).toHaveClass('input-error');
	});

	it("should throw an error if the user's email does not have correct length value", () => {
		renderSignup(false);

		const firstName = screen.getByLabelText('First Name');
		const lastName = screen.getByLabelText('Last Name');
		const email = screen.getByLabelText('Email');
		const password = screen.getByLabelText('Password');
		const confirmPassword = screen.getByLabelText('Confirm Password');
		const registerButton = screen.getByRole('button', {name: /Register/i});

		fireEvent.change(firstName, {target: {value: 'dummy'}});
		fireEvent.change(lastName, {target: {value: 'dummy'}});
		fireEvent.change(email, {
			target: {value: 'johniseatiingalotoffoodthesedaysproperlyhh@gmail.com'},
		});
		fireEvent.change(password, {target: {value: 'abc'}});
		fireEvent.change(confirmPassword, {target: {value: 'abc'}});
		fireEvent.click(registerButton);

		expect(
			screen.getByText('Email should not be more than 50 characters long'),
		).toHaveClass('input-error');
	});

	it("should throw an error if the user's password does not have correct length value", () => {
		renderSignup(false);

		const firstName = screen.getByLabelText('First Name');
		const lastName = screen.getByLabelText('Last Name');
		const email = screen.getByLabelText('Email');
		const password = screen.getByLabelText('Password');
		const confirmPassword = screen.getByLabelText('Confirm Password');
		const registerButton = screen.getByRole('button', {name: /Register/i});

		fireEvent.change(firstName, {target: {value: 'dummy'}});
		fireEvent.change(lastName, {target: {value: 'dummy'}});
		fireEvent.change(email, {
			target: {value: 'dummy@gmail.com'},
		});
		fireEvent.change(password, {target: {value: 'abc'}});
		fireEvent.change(confirmPassword, {target: {value: 'abc'}});
		fireEvent.click(registerButton);

		expect(
			screen.getByText('Password should be 8 to 30 characters long'),
		).toHaveClass('input-error');
	});

	it('should throw an error if first name value format is invalid', () => {
		renderSignup(false);

		const firstName = screen.getByLabelText('First Name');
		const lastName = screen.getByLabelText('Last Name');
		const email = screen.getByLabelText('Email');
		const password = screen.getByLabelText('Password');
		const confirmPassword = screen.getByLabelText('Confirm Password');
		const registerButton = screen.getByRole('button', {
			name: /Register/i,
		});

		fireEvent.change(firstName, {
			target: {value: 'jhon@'},
		});
		fireEvent.change(lastName, {
			target: {value: '12Doe'},
		});
		fireEvent.change(email, {
			target: {
				value: 'john',
			},
		});
		fireEvent.change(password, {target: {value: 'abcdefghijk'}});
		fireEvent.change(confirmPassword, {target: {value: 'abcdefghijk'}});
		fireEvent.click(registerButton);

		expect(
			screen.getByText('First name should only contain alphabets'),
		).toHaveClass('input-error');
	});

	it('should throw an error if last name value format is invalid', () => {
		renderSignup(false);

		const firstName = screen.getByLabelText('First Name');
		const lastName = screen.getByLabelText('Last Name');
		const email = screen.getByLabelText('Email');
		const password = screen.getByLabelText('Password');
		const confirmPassword = screen.getByLabelText('Confirm Password');
		const registerButton = screen.getByRole('button', {
			name: /Register/i,
		});

		fireEvent.change(firstName, {
			target: {value: 'dummy'},
		});
		fireEvent.change(lastName, {
			target: {value: '12Doe'},
		});
		fireEvent.change(email, {
			target: {
				value: 'john',
			},
		});
		fireEvent.change(password, {target: {value: 'abcdefghijk'}});
		fireEvent.change(confirmPassword, {target: {value: 'abcdefghijk'}});
		fireEvent.click(registerButton);

		expect(
			screen.getByText('Last name should only contain alphabets'),
		).toHaveClass('input-error');
	});

	it('should throw an error if email value format is invalid', () => {
		renderSignup(false);

		const firstName = screen.getByLabelText('First Name');
		const lastName = screen.getByLabelText('Last Name');
		const email = screen.getByLabelText('Email');
		const password = screen.getByLabelText('Password');
		const confirmPassword = screen.getByLabelText('Confirm Password');
		const registerButton = screen.getByRole('button', {
			name: /Register/i,
		});

		fireEvent.change(firstName, {
			target: {value: 'dummy'},
		});
		fireEvent.change(lastName, {
			target: {value: 'dummy'},
		});
		fireEvent.change(email, {
			target: {
				value: 'john',
			},
		});
		fireEvent.change(password, {target: {value: 'abcdefghijk'}});
		fireEvent.change(confirmPassword, {target: {value: 'abcdefghijk'}});
		fireEvent.click(registerButton);

		expect(screen.getByText('Invalid email format')).toHaveClass('input-error');
	});

	it('should throw an error if password value format is invalid', () => {
		renderSignup(false);

		const firstName = screen.getByLabelText('First Name');
		const lastName = screen.getByLabelText('Last Name');
		const email = screen.getByLabelText('Email');
		const password = screen.getByLabelText('Password');
		const confirmPassword = screen.getByLabelText('Confirm Password');
		const registerButton = screen.getByRole('button', {
			name: /Register/i,
		});

		fireEvent.change(firstName, {
			target: {value: 'dummy'},
		});
		fireEvent.change(lastName, {
			target: {value: 'dummy'},
		});
		fireEvent.change(email, {
			target: {
				value: 'dummy@gmail.com',
			},
		});
		fireEvent.change(password, {target: {value: 'abcdefghijk'}});
		fireEvent.change(confirmPassword, {target: {value: 'abcdefghijk'}});
		fireEvent.click(registerButton);

		expect(
			screen.getByText(
				'Password should contain at least one uppercase letter, one lowercase letter, one digit, and one special character',
			),
		).toHaveClass('input-error');
	});

	it('should throw an error if users password dont match', () => {
		renderSignup(false);

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
		fireEvent.change(confirmPassword, {target: {value: 'Def@1234'}});
		fireEvent.click(registerButton);

		expect(screen.getByText('Passwords do not match')).toHaveClass(
			'input-error',
		);
	});

	it('should register a user successfully', async () => {
		renderSignup(false);

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
		fireEvent.click(registerButton);

		await waitFor(() => {
			expect(
				screen.getByText(
					/User created successfully. Verification email sent./i,
				),
			).toHaveClass('signup-success');
		});
	});

	it('should navigate to dashboard', () => {
		renderSignup(true);
		expect(Navigate).toHaveBeenCalledTimes(1);
		expect(Navigate).toHaveBeenCalledWith({to: '/dashboard'}, {});
	});
});
