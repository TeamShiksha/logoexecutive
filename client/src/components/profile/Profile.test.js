import React from 'react';
import {render, fireEvent, screen, waitFor} from '@testing-library/react';
import Profile from './Profile';
import {AuthContext} from '../../contexts/AuthContext';
import {UserContext} from '../../contexts/UserContext';
import {BrowserRouter} from 'react-router-dom';

describe('Profile component', () => {
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
	const renderProfile = () => {
		render(
			<AuthContext.Provider value={true}>
				<UserContext.Provider value={{userData: mockUserData, fetchUserData}}>
					<BrowserRouter>
						<Profile />
					</BrowserRouter>
				</UserContext.Provider>
			</AuthContext.Provider>,
		);
	};
	it('renders without crashing', () => {
		renderProfile();

		expect(screen.getByText('Profile')).toBeInTheDocument();
		expect(screen.getByText('Change Password')).toBeInTheDocument();
	});

	it('updates first name on input change', () => {
		renderProfile();

		const firstNameInput = screen.getByLabelText('first name');
		fireEvent.change(firstNameInput, {target: {value: 'John'}});

		expect(firstNameInput.value).toBe('John');
	});

	it('updates last name on input change', () => {
		renderProfile();

		const lastNameInput = screen.getByLabelText('last name');
		fireEvent.change(lastNameInput, {target: {value: 'Doe'}});

		expect(lastNameInput.value).toBe('Doe');
	});

	it('updates email on input change', () => {
		renderProfile();

		const email = screen.getByLabelText('email');
		fireEvent.change(email, {target: {value: 'abc@gmail.com'}});

		expect(email.value).toBe('abc@gmail.com');
	});

	it('should alert if first name is empty', () => {
		renderProfile();

		const firstName = screen.getByLabelText('first name');
		const lastName = screen.getByLabelText('last name');
		const saveButton = screen.getByTestId('profile-button');

		fireEvent.change(firstName, {
			target: {value: ''},
		});
		fireEvent.change(lastName, {
			target: {value: '12Doe'},
		});
		fireEvent.click(saveButton);

		expect(firstName.validity.valueMissing).toBe(true);
	});

	it('should alert if last name is empty', () => {
		renderProfile();

		const firstName = screen.getByLabelText('first name');
		const lastName = screen.getByLabelText('last name');
		const saveButton = screen.getByTestId('profile-button');

		fireEvent.change(firstName, {
			target: {value: 'John'},
		});
		fireEvent.change(lastName, {
			target: {value: ''},
		});
		fireEvent.click(saveButton);

		expect(lastName.validity.valueMissing).toBe(true);
	});

	it('should throw an error if first name value format is invalid', () => {
		renderProfile();

		const firstName = screen.getByLabelText('first name');
		const lastName = screen.getByLabelText('last name');
		const saveButton = screen.getByTestId('profile-button');

		fireEvent.change(firstName, {
			target: {value: 'jhon@'},
		});
		fireEvent.change(lastName, {
			target: {value: '12Doe'},
		});
		fireEvent.click(saveButton);

		expect(
			screen.getByText('First name should only contain alphabets'),
		).toHaveClass('form-error');
	});

	it('should throw an error if last name value format is invalid', () => {
		renderProfile();

		const firstName = screen.getByLabelText('first name');
		const lastName = screen.getByLabelText('last name');
		const saveButton = screen.getByTestId('profile-button');

		fireEvent.change(firstName, {
			target: {value: 'dummy'},
		});
		fireEvent.change(lastName, {
			target: {value: '12Doe'},
		});
		fireEvent.click(saveButton);

		expect(
			screen.getByText('Last name should only contain alphabets'),
		).toHaveClass('form-error');
	});

	it("should throw an error if the user's first name does not have correct length value", () => {
		renderProfile();

		const firstName = screen.getByLabelText('first name');
		const lastName = screen.getByLabelText('last name');
		const saveButton = screen.getByTestId('profile-button');

		fireEvent.change(firstName, {
			target: {value: 'loremIpsumissimplydummy'},
		});
		fireEvent.change(lastName, {
			target: {value: 'loremIpsumissimplydummy'},
		});
		fireEvent.click(saveButton);

		expect(
			screen.getByText('First name should be 1 to 20 characters long'),
		).toHaveClass('form-error');
	});

	it("should throw an error if the user's last name does not have correct length value", () => {
		renderProfile();

		const firstName = screen.getByLabelText('first name');
		const lastName = screen.getByLabelText('last name');
		const saveButton = screen.getByTestId('profile-button');

		fireEvent.change(firstName, {
			target: {value: 'dummy'},
		});
		fireEvent.change(lastName, {
			target: {value: 'loremIpsumissimplydummy'},
		});
		fireEvent.click(saveButton);

		expect(
			screen.getByText('Last name should be 1 to 20 characters long'),
		).toHaveClass('form-error');
	});

	it('should trigger fetchUserData on component mount', () => {
		renderProfile();

		expect(fetchUserData).toHaveBeenCalled();
	});

	it('should update state with userData on userData change', () => {
		const {rerender} = render(
			<AuthContext.Provider value={true}>
				<UserContext.Provider value={{userData: {}, fetchUserData}}>
					<BrowserRouter>
						<Profile />
					</BrowserRouter>
				</UserContext.Provider>
			</AuthContext.Provider>,
		);

		const newUserData = {
			firstName: 'John',
			lastName: 'Doe',
			email: 'john@example.com',
		};

		rerender(
			<AuthContext.Provider value={true}>
				<UserContext.Provider value={{userData: newUserData, fetchUserData}}>
					<BrowserRouter>
						<Profile />
					</BrowserRouter>
				</UserContext.Provider>
			</AuthContext.Provider>,
		);

		const firstNameInput = screen.getByLabelText('first name');
		const lastNameInput = screen.getByLabelText('last name');
		const emailInput = screen.getByLabelText('email');

		expect(firstNameInput.value).toBe('John');
		expect(lastNameInput.value).toBe('Doe');
		expect(emailInput.value).toBe('john@example.com');
	});

	it('should update the user first name and last name successfully', async () => {
		renderProfile();

		const firstName = screen.getByLabelText('first name');
		const lastName = screen.getByLabelText('last name');
		const saveButton = screen.getByTestId('profile-button');

		fireEvent.change(firstName, {
			target: {value: 'Anoop'},
		});
		fireEvent.change(lastName, {
			target: {value: 'Singh'},
		});
		fireEvent.click(saveButton);

		await waitFor(() => {
			expect(screen.getByText(/Profile Updated Successfully/i)).toHaveClass(
				'profile-update-success',
			);
		});
	});

	it('displays error message when first name is invalid', async () => {
		renderProfile();

		const firstName = screen.getByLabelText('first name');
		const lastName = screen.getByLabelText('last name');
		const saveButton = screen.getByTestId('profile-button');

		fireEvent.change(firstName, {
			target: {value: 'abc123'},
		});
		fireEvent.change(lastName, {
			target: {value: 'Singh'},
		});
		fireEvent.click(saveButton);

		await waitFor(() => {
			expect(
				screen.getByText(/First name should only contain alphabets/i),
			).toBeInTheDocument();
		});
	});

	it('updates old password on input change', () => {
		renderProfile();
		const oldPasswordInput = screen.getByLabelText('old password');
		fireEvent.change(oldPasswordInput, {target: {value: 'oldPassword123'}});
		expect(oldPasswordInput.value).toBe('oldPassword123');
	});

	it('updates new password on input change', () => {
		renderProfile();
		const newPasswordInput = screen.getByLabelText('new password');
		fireEvent.change(newPasswordInput, {target: {value: 'newPassword456'}});
		expect(newPasswordInput.value).toBe('newPassword456');
	});

	it('updates repeat new password on input change', () => {
		renderProfile();
		const repeatNewPasswordInput = screen.getByLabelText('repeat new password');
		fireEvent.change(repeatNewPasswordInput, {
			target: {value: 'newPassword456'},
		});
		expect(repeatNewPasswordInput.value).toBe('newPassword456');
	});

	it('display error when password is invalid', async () => {
		renderProfile();
		const oldPasswordInput = screen.getByTestId('old-password');
		const newPasswordInput = screen.getByTestId('new-password');
		const repeatNewPasswordInput = screen.getByTestId('repeat-new-password');
		const passwordError = screen.getByTestId('password-error');
		const saveButton = screen.getByTestId('change-password-button');

		//Invalid old password
		fireEvent.change(oldPasswordInput, {target: {value: '1234'}});
		fireEvent.click(saveButton);
		expect(passwordError).toHaveTextContent('Invalid old password');

		//Invalid new password
		fireEvent.change(oldPasswordInput, {target: {value: 'oldPassword@123'}});
		fireEvent.change(newPasswordInput, {target: {value: '123'}});
		fireEvent.click(saveButton);
		expect(passwordError).toHaveTextContent('Invalid new password');

		//Password does not match
		fireEvent.change(newPasswordInput, {target: {value: 'newPassword@123'}});
		fireEvent.click(saveButton);
		expect(passwordError).toHaveTextContent('Password does not match');

		//New password cannot be same as old password
		fireEvent.change(newPasswordInput, {target: {value: 'newPassword@123'}});
		fireEvent.change(repeatNewPasswordInput, {
			target: {value: 'newPassword@123'},
		});
		fireEvent.change(oldPasswordInput, {target: {value: 'newPassword@123'}});
		fireEvent.click(saveButton);
		expect(passwordError).toHaveTextContent(
			'New password cannot be same as old password',
		);
	});
	it('should not update the password successfully if old password is invalid', async () => {
		renderProfile();
		const oldPasswordInput = screen.getByTestId('old-password');
		const newPasswordInput = screen.getByTestId('new-password');
		const repeatNewPasswordInput = screen.getByTestId('repeat-new-password');
		const saveButton = screen.getByTestId('change-password-button');

		fireEvent.change(oldPasswordInput, {target: {value: 'invalidPass@123'}});
		fireEvent.change(newPasswordInput, {target: {value: 'newPassword@456'}});
		fireEvent.change(repeatNewPasswordInput, {
			target: {value: 'newPassword@456'},
		});
		fireEvent.click(saveButton);

		await waitFor(() => {
			const passwordError = screen.getByTestId('password-error');
			expect(passwordError).toHaveTextContent('Current password is incorrect');
		});
	});
	it('should update the password successfully', async () => {
		renderProfile();
		const oldPasswordInput = screen.getByTestId('old-password');
		const newPasswordInput = screen.getByTestId('new-password');
		const repeatNewPasswordInput = screen.getByTestId('repeat-new-password');
		const saveButton = screen.getByTestId('change-password-button');

		fireEvent.change(oldPasswordInput, {target: {value: 'oldPassword@123'}});
		fireEvent.change(newPasswordInput, {target: {value: 'newPassword@456'}});
		fireEvent.change(repeatNewPasswordInput, {
			target: {value: 'newPassword@456'},
		});
		fireEvent.click(saveButton);

		await waitFor(() => {
			expect(
				screen.getByText(/Password Updated Successfully/i),
			).toBeInTheDocument();
		});
		expect(oldPasswordInput.innerText).toBe(undefined);
		expect(newPasswordInput.innerText).toBe(undefined);
		expect(repeatNewPasswordInput.innerText).toBe(undefined);
	});
});
