import React from 'react';
import {render, fireEvent, screen} from '@testing-library/react';
import Profile from './Profile';

describe('Profile component', () => {
	it('renders without crashing', () => {
		render(<Profile />);
		expect(screen.getByText('Profile')).toBeInTheDocument();
		expect(screen.getByText('Change Password')).toBeInTheDocument();
	});

	it('updates first name on input change', () => {
		render(<Profile />);
		const firstNameInput = screen.getByLabelText('first name');
		fireEvent.change(firstNameInput, {target: {value: 'John'}});
		expect(firstNameInput.value).toBe('John');
	});

	it('updates last name on input change', () => {
		render(<Profile />);
		const lastNameInput = screen.getByLabelText('last name');
		fireEvent.change(lastNameInput, {target: {value: 'Doe'}});
		expect(lastNameInput.value).toBe('Doe');
	});

	it('updates email on input change', () => {
		render(<Profile />);
		const emailInput = screen.getByLabelText('email');
		fireEvent.change(emailInput, {target: {value: 'john.doe@example.com'}});
		expect(emailInput.value).toBe('john.doe@example.com');
	});

	it('updates old password on input change', () => {
		render(<Profile />);
		const oldPasswordInput = screen.getByLabelText('old password');
		fireEvent.change(oldPasswordInput, {target: {value: 'oldPassword123'}});
		expect(oldPasswordInput.value).toBe('oldPassword123');
	});

	it('updates new password on input change', () => {
		render(<Profile />);
		const newPasswordInput = screen.getByLabelText('new password');
		fireEvent.change(newPasswordInput, {target: {value: 'newPassword456'}});
		expect(newPasswordInput.value).toBe('newPassword456');
	});

	it('updates repeat new password on input change', () => {
		render(<Profile />);
		const repeatNewPasswordInput = screen.getByLabelText('repeat new password');
		fireEvent.change(repeatNewPasswordInput, {
			target: {value: 'newPassword456'},
		});
		expect(repeatNewPasswordInput.value).toBe('newPassword456');
	});

	// Add test cases to cover scenario when form is submitted
});
