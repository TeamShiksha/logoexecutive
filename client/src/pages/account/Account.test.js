import React from 'react';
import {render, screen} from '@testing-library/react';
import Account from './Account';
import {BrowserRouter} from 'react-router-dom';
import {AuthContext} from '../../contexts/AuthContext';
import {UserContext} from '../../contexts/UserContext';

describe('Account Component', () => {
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
	const renderAccount = () => {
		render(
			<AuthContext.Provider value={false}>
				<UserContext.Provider value={{userData: mockUserData, fetchUserData}}>
					<BrowserRouter>
						<Account />
					</BrowserRouter>
				</UserContext.Provider>
			</AuthContext.Provider>,
		);
	};

	it('renders without crashing', () => {
		renderAccount();
		const accountContainer = screen.getByTestId('testid-account');
		expect(accountContainer).toBeInTheDocument();
	});

	it('renders Profile, Divider, and Settings components', () => {
		renderAccount();
		const profileComponent = screen.getByTestId('testid-profile');
		const dividerComponent = screen.getByTestId('divider');
		const settingsComponent = screen.getByTestId('testid-settings');
		expect(profileComponent).toBeInTheDocument();
		expect(dividerComponent).toBeInTheDocument();
		expect(settingsComponent).toBeInTheDocument();
	});

	it('renders child components in the correct order', () => {
		renderAccount();
		const profileComponent = screen.getByTestId('testid-profile');
		const dividerComponent = screen.getByTestId('divider');
		const settingsComponent = screen.getByTestId('testid-settings');
		// eslint-disable-next-line testing-library/no-node-access
		const containerChildren = screen.getByTestId('testid-account').children;
		expect(containerChildren[0]).toEqual(profileComponent);
		expect(containerChildren[1]).toEqual(dividerComponent);
		expect(containerChildren[2]).toEqual(settingsComponent);
	});

	it('renders with correct CSS classes', () => {
		renderAccount();
		const accountContainer = screen.getByTestId('testid-account');
		expect(accountContainer).toHaveClass('account-container');
	});
});
