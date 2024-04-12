/* eslint-disable testing-library/no-unnecessary-act */
import {waitFor, fireEvent, render, screen} from '@testing-library/react';
import {BrowserRouter} from 'react-router-dom';
import Signup from './Signup';
import {AuthContext} from '../../contexts/AuthContext';
import {setupServer} from 'msw/node';
import handlers from '../../mocks/handlers.js';
import {signupHandler} from '../../mocks/handlers/signup-handler';
import {toHaveClass} from '@testing-library/jest-dom/matchers.js';

const server = setupServer(...handlers);

describe('Signup', () => {
	beforeAll(() => {
		server.listen();
	});
	afterEach(() => {
		server.resetHandlers();
	});
	afterAll(() => {
		server.close();
	});

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

	it('should throw an error if either any of the field value is missing', () => {
		renderSignup();

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

		expect(screen.getByText('First name is required.')).toHaveClass('error');
		expect(screen.getByText('Last name is required.')).toHaveClass('error');
		expect(screen.getByText('Email is required.')).toHaveClass('error');
		expect(screen.getByText('Password is required.')).toHaveClass('error');
	});

	it("should throw an error if the user's input field does not have correct length value", () => {
		renderSignup();

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
			screen.getByText('First name should be 1 to 20 characters long.'),
		).toHaveClass('error');
		expect(
			screen.getByText('Last name should be 1 to 20 characters long.'),
		).toHaveClass('error');
		expect(
			screen.getByText('Email should not be more than 50 characters long.'),
		).toHaveClass('error');
		expect(
			screen.getByText('Password should be 8 to 30 characters long.'),
		).toHaveClass('error');
	});

	it('should throw an error if input value format is invalid', () => {
		renderSignup();

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
			screen.getByText('First name should only contain alphabets.'),
		).toHaveClass('error');
		expect(
			screen.getByText('Last name should only contain alphabets.'),
		).toHaveClass('error');
		expect(screen.getByText('Invalid email format.')).toHaveClass('error');
		expect(
			screen.getByText(
				'Password should contain at least one uppercase letter, one lowercase letter, one digit, and one special character.',
			),
		).toHaveClass('error');
	});

	it('should throw an error if users password dont match', () => {
		renderSignup();

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

		expect(screen.getByText('Passwords do not match.')).toHaveClass('error');
	});

	it('should register a user successfully', async () => {
		server.use(signupHandler);

		renderSignup();

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
});
