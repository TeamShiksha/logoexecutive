import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import {BrowserRouter} from 'react-router-dom';
import Contactus from './Contactus';
import {UserContext} from '../../contexts/UserContext';
import {AuthContext} from '../../contexts/AuthContext';

describe('Contact Us Component', () => {
	const mockUserData = {
		firstName: 'Anoop',
		lastName: 'Singh',
		email: 'aps08@gmail.com',
		userId: '99234290-a33b-40d1-a5d4-888e86d06cd1',
		userType: 'CUSTOMER',
		keys: [
			{
				keyId: '4d6544e38f5d4ad8bae546ea61e2b842',
				key: '4d6544e38f5d4ad8bae546ea61e2b842',
				usageCount: '0',
				keyDescription: 'Demo Key',
				updatedAt: new Date().toLocaleDateString('en-US', {
					day: '2-digit',
					month: 'short',
					year: 'numeric',
				}),
				createdAt: new Date().toLocaleDateString('en-US', {
					day: '2-digit',
					month: 'short',
					year: 'numeric',
				}),
			},
		],
		subscription: {
			subscriptionId: '4d6544e3-8f5d-4ad8-bae5-46ea61e2b842',
			subscriptionType: 'HOBBY',
			keyLimit: 2,
			usageLimit: 500,
			isActive: false,
			createdAt: '2024-04-11T10:24:38.501Z',
			updatedAt: '2024-04-11T10:24:38.501Z',
		},
	};
	const fetchUserData = jest.fn();
	const renderContactUs = () => {
		render(
			<AuthContext.Provider
				value={{
					isAuthenticated: false,
				}}
			>
				<UserContext.Provider value={{userData: mockUserData, fetchUserData}}>
					<BrowserRouter>
						<Contactus />
					</BrowserRouter>
				</UserContext.Provider>
			</AuthContext.Provider>,
		);
	};

	it('renders without crashing', () => {
		renderContactUs();
		expect(screen.getByText('Contact us')).toBeInTheDocument();
		expect(screen.getByText('Get in touch')).toBeInTheDocument();
		expect(screen.getByText('Get a demo')).toBeInTheDocument();
	});

	it('renders Get in touch section with correct text', () => {
		renderContactUs();
		const getInTouchHeader = screen.getByText('Get in touch');
		const getInTouchText = screen.getByText(
			'We’re always here to help. Contact us if you are experiencing issues with our product or have any questions.',
		);

		expect(getInTouchHeader).toBeInTheDocument();
		expect(getInTouchText).toBeInTheDocument();
	});

	it('renders link to Get a demo section', () => {
		renderContactUs();
		const getADemoLink = screen.getByText('Get a demo');
		expect(getADemoLink).toHaveAttribute('href', '/home#demo');
	});

	it('renders arrow icon next to Get a demo link', () => {
		renderContactUs();
		const arrowIcon = screen.getByTestId('contact-arrow-icon');
		expect(arrowIcon).toBeInTheDocument();
	});

	it('displays error for empty name', () => {
		renderContactUs();
		const nameInput = screen.getByLabelText('name');
		const sendButton = screen.getByText('Send Message');

		fireEvent.change(nameInput, {target: {value: ''}});
		fireEvent.click(sendButton);

		expect(screen.getByText('Name is required')).toBeInTheDocument();
	});

	it('displays error for non-alphabetic characters in name', () => {
		renderContactUs();
		const nameInput = screen.getByLabelText('name');
		const sendButton = screen.getByText('Send Message');

		fireEvent.change(nameInput, {target: {value: '123'}});
		fireEvent.click(sendButton);

		expect(
			screen.getByText('Name should only contain alphabets'),
		).toBeInTheDocument();
	});

	it('displays error for name length outside the range', () => {
		renderContactUs();
		const nameInput = screen.getByLabelText('name');
		const sendButton = screen.getByText('Send Message');

		fireEvent.change(nameInput, {
			target: {
				value:
					'Lorem Ipsum is simply dummy text for printing Lorem Ipsum is simply dummy text for printing',
			},
		});
		fireEvent.click(sendButton);

		expect(
			screen.getByText('Name should be 1 to 20 characters long'),
		).toBeInTheDocument();
	});

	it('displays error for empty email', () => {
		renderContactUs();
		const nameInput = screen.getByLabelText('name');
		const emailInput = screen.getByLabelText('email');
		const sendButton = screen.getByText('Send Message');

		fireEvent.change(nameInput, {target: {value: 'Lakshay'}});
		fireEvent.change(emailInput, {target: {value: ''}});
		fireEvent.click(sendButton);

		expect(screen.getByText('Email is required')).toBeInTheDocument();
	});

	it('displays error for long email', () => {
		renderContactUs();
		const nameInput = screen.getByLabelText('name');
		const emailInput = screen.getByLabelText('email');
		const sendButton = screen.getByText('Send Message');

		fireEvent.change(nameInput, {target: {value: 'Lakshay'}});
		fireEvent.change(emailInput, {
			target: {
				value: 'toolongemailaddressoolongemail@toolongemailaddress.com',
			},
		});
		fireEvent.click(sendButton);

		expect(
			screen.getByText('Email should not be more than 50 characters long'),
		).toBeInTheDocument();
	});

	it('displays error for invalid email format', () => {
		renderContactUs();
		const nameInput = screen.getByLabelText('name');
		const emailInput = screen.getByLabelText('email');
		const sendButton = screen.getByText('Send Message');

		fireEvent.change(nameInput, {target: {value: 'Lakshay'}});
		fireEvent.change(emailInput, {target: {value: 'invalidemail@'}});
		fireEvent.click(sendButton);

		expect(screen.getByText('Invalid email format')).toBeInTheDocument();
	});

	it('displays error for empty message', () => {
		renderContactUs();
		const nameInput = screen.getByLabelText('name');
		const emailInput = screen.getByLabelText('email');
		const messageInput = screen.getByLabelText('message');
		const sendButton = screen.getByText('Send Message');

		fireEvent.change(nameInput, {target: {value: 'Lakshay'}});
		fireEvent.change(emailInput, {target: {value: 'lakshay@gmail.com'}});
		fireEvent.change(messageInput, {target: {value: ''}});
		fireEvent.click(sendButton);

		expect(screen.getByText('Message is required')).toBeInTheDocument();
	});

	it('displays error for short message', () => {
		renderContactUs();
		const nameInput = screen.getByLabelText('name');
		const emailInput = screen.getByLabelText('email');
		const messageInput = screen.getByLabelText('message');
		const sendButton = screen.getByText('Send Message');

		fireEvent.change(nameInput, {target: {value: 'Lakshay'}});
		fireEvent.change(emailInput, {target: {value: 'lakshay@gmail.com'}});
		fireEvent.change(messageInput, {target: {value: 'Short message'}});
		fireEvent.click(sendButton);

		expect(
			screen.getByText('Message should be at least 20 characters'),
		).toBeInTheDocument();
	});

	it('displays error for long message', () => {
		renderContactUs();
		const nameInput = screen.getByLabelText('name');
		const emailInput = screen.getByLabelText('email');
		const messageInput = screen.getByLabelText('message');
		const sendButton = screen.getByText('Send Message');

		fireEvent.change(nameInput, {target: {value: 'Lakshay'}});
		fireEvent.change(emailInput, {target: {value: 'lakshay@gmail.com'}});
		fireEvent.change(messageInput, {
			target: {
				value:
					'Lorem Ipsum is simply dummy text for printing and typesetting industry Lorem Ipsum has been the industry Lorem Ipsum is simply dummy text for printing and typesetting industry Lorem Ipsum has been the industry Lorem Ipsum is simply dummy text for printing and typesetting industry Lorem Ipsum has been the industryLorem Ipsum is simply dummy text for printing and typesetting industry Lorem Ipsum has been the industryLorem Ipsum is simply dummy text for printing and typesetting industry Lorem Ipsum has been the industry',
			},
		});
		fireEvent.click(sendButton);

		expect(
			screen.getByText('Message must be 500 or fewer characters'),
		).toBeInTheDocument();
	});

	it('displays error for non-alphabetic characters in message', () => {
		renderContactUs();
		const nameInput = screen.getByLabelText('name');
		const emailInput = screen.getByLabelText('email');
		const messageInput = screen.getByLabelText('message');
		const sendButton = screen.getByText('Send Message');

		fireEvent.change(nameInput, {target: {value: 'Lakshay'}});
		fireEvent.change(emailInput, {target: {value: 'lakshay@gmail.com'}});
		fireEvent.change(messageInput, {
			target: {
				value: '123456 Lorem Ipsum is simply dummy text',
			},
		});
		fireEvent.click(sendButton);

		expect(
			screen.getByText('Message should only contain alphabets'),
		).toBeInTheDocument();
	});

	it('displays error for SQL injection attempt in message', () => {
		renderContactUs();
		const nameInput = screen.getByLabelText('name');
		const emailInput = screen.getByLabelText('email');
		const messageInput = screen.getByLabelText('message');
		const sendButton = screen.getByText('Send Message');

		fireEvent.change(nameInput, {target: {value: 'Lakshay'}});
		fireEvent.change(emailInput, {target: {value: 'lakshay@gmail.com'}});
		fireEvent.change(messageInput, {
			target: {value: 'SELECT FROM users users'},
		});
		fireEvent.click(sendButton);

		expect(
			screen.getByText('Message contains SQL keywords or characters'),
		).toBeInTheDocument();
	});

	it('allows users to input name, email,message and click send button', async () => {
		renderContactUs();
		const nameInput = screen.getByLabelText('name');
		const emailInput = screen.getByLabelText('email');
		const messageInput = screen.getByLabelText('message');
		const sendButton = screen.getByText('Send Message');
		const messageText =
			'Lorem Ipsum is simply dummy text of the printing and typesetting industry Lorem Ipsum has been the industry';

		fireEvent.change(nameInput, {target: {value: 'Lakshay saini'}});
		fireEvent.change(emailInput, {target: {value: 'lakshay@gmail.com'}});
		fireEvent.change(messageInput, {target: {value: messageText}});

		expect(nameInput.value).toBe('Lakshay saini');
		expect(emailInput.value).toBe('lakshay@gmail.com');
		expect(messageInput.value).toBe(messageText);
		fireEvent.click(sendButton);

		await screen.findByText('Message sent successfully!');
		expect(nameInput.value).toBe('');
		expect(emailInput.value).toBe('');
		expect(messageInput.value).toBe('');
	});

	it('pre-fills name and email fields if user is authenticated', () => {
		render(
			<AuthContext.Provider
				value={{
					isAuthenticated: true,
				}}
			>
				<UserContext.Provider value={{userData: mockUserData, fetchUserData}}>
					<BrowserRouter>
						<Contactus />
					</BrowserRouter>
				</UserContext.Provider>
			</AuthContext.Provider>,
		);

		const nameInput = screen.getByLabelText('name');
		const emailInput = screen.getByLabelText('email');

		expect(nameInput.value).toBe('Anoop');
		expect(emailInput.value).toBe('aps08@gmail.com');
	});

	it('does not pre-fill name and email fields if user is not authenticated', () => {
		render(
			<AuthContext.Provider
				value={{
					isAuthenticated: false,
				}}
			>
				<UserContext.Provider value={{userData: mockUserData, fetchUserData}}>
					<BrowserRouter>
						<Contactus />
					</BrowserRouter>
				</UserContext.Provider>
			</AuthContext.Provider>,
		);

		const nameInput = screen.getByLabelText('name');
		const emailInput = screen.getByLabelText('email');

		expect(nameInput.value).toBe('');
		expect(emailInput.value).toBe('');
	});
});
