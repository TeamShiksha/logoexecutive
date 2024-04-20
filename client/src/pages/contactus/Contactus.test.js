import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import {BrowserRouter} from 'react-router-dom';
import Contactus from './Contactus';

describe('Contact Us Component', () => {
	const renderContactUs = () => {
		render(
			<BrowserRouter>
				<Contactus />
			</BrowserRouter>,
		);
	};

	it('renders without crashing', () => {
		renderContactUs();
		expect(screen.getByText('Contact us')).toBeInTheDocument();
		expect(screen.getByText('Get in touch')).toBeInTheDocument();
		expect(screen.getByText('Get a demo')).toBeInTheDocument();
	});

	it('allows users to input name, email,message and click send button', () => {
		renderContactUs();
		const nameInput = screen.getByLabelText('name');
		const emailInput = screen.getByLabelText('email');
		const messageInput = screen.getByLabelText('message');
		const sendButton = screen.getByText('Send Message');

		fireEvent.change(nameInput, {target: {value: 'Lakshay saini'}});
		fireEvent.change(emailInput, {target: {value: 'lakshay@gmail.com'}});
		fireEvent.change(messageInput, {target: {value: 'Contact Us'}});

		expect(nameInput.value).toBe('Lakshay saini');
		expect(emailInput.value).toBe('lakshay@gmail.com');
		expect(messageInput.value).toBe('Contact Us');
		fireEvent.click(sendButton);
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
		expect(getADemoLink).toHaveAttribute('href', '/welcome#demo');
	});

	it('renders arrow icon next to Get a demo link', () => {
		renderContactUs();
		const arrowIcon = screen.getByTestId('contact-arrow-icon');
		expect(arrowIcon).toBeInTheDocument();
	});
});
