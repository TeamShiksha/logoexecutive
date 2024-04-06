import {fireEvent, render, screen} from '@testing-library/react';
import {BrowserRouter} from 'react-router-dom';
import Dropdown from './Dropdown';
import {AuthContext} from '../../contexts/AuthContext';

describe('Dropdown test', () => {
	const mockLogout = jest.fn();
	const toggleShowAccount = jest.fn();

	const renderDropdown = () => {
		render(
			<AuthContext.Provider value={{isAuthenticated: true, logout: mockLogout}}>
				<BrowserRouter>
					<Dropdown
						handleLogout={mockLogout}
						toggleShowAccount={toggleShowAccount}
					/>
				</BrowserRouter>
			</AuthContext.Provider>,
		);
	};

	afterEach(() => {
		jest.clearAllMocks();
	});

	test('renders without crashing', () => {
		renderDropdown();
		expect(screen.getByText('Profile')).toBeInTheDocument();
		expect(screen.getByText('Logout')).toBeInTheDocument();
	});

	test('should contain a link to /profile', () => {
		renderDropdown();
		const profileLink = screen.getByTestId('profile-link');
		fireEvent.click(profileLink);
		expect(profileLink).toHaveAttribute('href', '/profile');
	});

	test('should call handleLogout when Logout option is clicked', () => {
		renderDropdown();
		const logout = screen.getByTestId('logout-option');
		fireEvent.click(logout);
		expect(mockLogout).toHaveBeenCalled();
		expect(toggleShowAccount).toHaveBeenCalled();
	});
});
