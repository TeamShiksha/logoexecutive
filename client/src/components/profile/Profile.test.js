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
});
