import React from 'react';
import {render, fireEvent, screen} from '@testing-library/react';
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
		const emailInput = screen.getByLabelText('email');
		fireEvent.change(emailInput, {target: {value: 'john.doe@example.com'}});
		expect(emailInput.value).toBe('john.doe@example.com');
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
});
