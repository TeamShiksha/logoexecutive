import React from 'react';
import {render, fireEvent, screen} from '@testing-library/react';
import ChangePasswordForm from './ChangePasswordForm';

describe('Profile component', () => {
	const renderChangePasswordForm = () => render(<ChangePasswordForm />);

	it('updates old password on input change', () => {
		renderChangePasswordForm();
		const oldPasswordInput = screen.getByLabelText('old password');
		fireEvent.change(oldPasswordInput, {target: {value: 'oldPassword123'}});
		expect(oldPasswordInput.value).toBe('oldPassword123');
	});

	it('updates new password on input change', () => {
		renderChangePasswordForm();
		const newPasswordInput = screen.getByLabelText('new password');
		fireEvent.change(newPasswordInput, {target: {value: 'newPassword456'}});
		expect(newPasswordInput.value).toBe('newPassword456');
	});

	it('updates repeat new password on input change', () => {
		renderChangePasswordForm();
		const repeatNewPasswordInput = screen.getByLabelText('repeat new password');
		fireEvent.change(repeatNewPasswordInput, {
			target: {value: 'newPassword456'},
		});
		expect(repeatNewPasswordInput.value).toBe('newPassword456');
	});
});
