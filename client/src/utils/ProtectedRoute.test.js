import {render, screen} from '@testing-library/react';
import {AuthContext} from '../contexts/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import {BrowserRouter, MemoryRouter, Route, Routes} from 'react-router-dom';
import {UserContext} from '../contexts/UserContext';
import {Account, Dashboard, Signin} from '../pages';

describe('Protected Route', () => {
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
	it('renders dashboard when user is authenticated', () => {
		render(
			<AuthContext.Provider value={{isAuthenticated: true}}>
				<UserContext.Provider value={{userData: mockUserData, fetchUserData}}>
					<BrowserRouter>
						<ProtectedRoute>
							<Dashboard />
						</ProtectedRoute>
					</BrowserRouter>
				</UserContext.Provider>
			</AuthContext.Provider>,
		);
		const dashboardElement = screen.getByTestId('testid-dashboard');
		expect(dashboardElement).toBeInTheDocument();
	});
	it('renders Account when user is authenticated', () => {
		render(
			<AuthContext.Provider value={{isAuthenticated: true}}>
				<UserContext.Provider value={{userData: mockUserData, fetchUserData}}>
					<BrowserRouter>
						<ProtectedRoute>
							<Account />
						</ProtectedRoute>
					</BrowserRouter>
				</UserContext.Provider>
			</AuthContext.Provider>,
		);
		const dashboardElement = screen.getByTestId('testid-account');
		expect(dashboardElement).toBeInTheDocument();
	});
	it('redirect to the sign-in route when the user is not authenticated to access the dashboard', () => {
		render(
			<AuthContext.Provider value={{isAuthenticated: false}}>
				<UserContext.Provider value={{userData: mockUserData, fetchUserData}}>
					<MemoryRouter initialEntries={['/dashboard']}>
						<Routes>
							<Route
								path='/dashboard'
								element={
									<ProtectedRoute>
										<Dashboard />
									</ProtectedRoute>
								}
							/>
							<Route path='/signin' element={<Signin />} />
						</Routes>
					</MemoryRouter>
				</UserContext.Provider>
			</AuthContext.Provider>,
		);
		expect(screen.getByText(/Sign in to dashboard/i)).toBeInTheDocument();
	});
	it('redirect to the sign-in route when the user is not authenticated to access the Account', () => {
		render(
			<AuthContext.Provider value={{isAuthenticated: false}}>
				<UserContext.Provider value={{userData: mockUserData, fetchUserData}}>
					<MemoryRouter initialEntries={['/profile']}>
						<Routes>
							<Route
								path='/profile'
								element={
									<ProtectedRoute>
										<Account />
									</ProtectedRoute>
								}
							/>
							<Route path='/signin' element={<Signin />} />
						</Routes>
					</MemoryRouter>
				</UserContext.Provider>
			</AuthContext.Provider>,
		);
		expect(screen.getByText(/Sign in to dashboard/i)).toBeInTheDocument();
	});
});
