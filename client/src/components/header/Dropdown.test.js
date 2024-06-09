import {fireEvent, render, screen} from '@testing-library/react';
import {BrowserRouter} from 'react-router-dom';
import Dropdown from './Dropdown';
import {AuthContext} from '../../contexts/AuthContext';
import * as router from 'react-router';

describe('Dropdown test', () => {
	const navigate = jest.fn();
	const mockLogout = jest.fn();
	const toggleShowAccount = jest.fn();
	const handleLogout = jest.fn();

	const renderDropdown = () => {
		render(
			<AuthContext.Provider value={{isAuthenticated: true, logout: mockLogout}}>
				<BrowserRouter>
					<Dropdown
						handleLogout={handleLogout}
						toggleShowAccount={toggleShowAccount}
					/>
				</BrowserRouter>
			</AuthContext.Provider>,
		);
	};

	beforeEach(() => {
		jest.spyOn(router, 'useNavigate').mockImplementation(() => navigate);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	test('renders without crashing', () => {
		renderDropdown();
		expect(screen.getByText('Profile')).toBeInTheDocument();
		expect(screen.getByText('Logout')).toBeInTheDocument();
	});

	test('should navigate to /profile', () => {
		renderDropdown();
		const profileLink = screen.getByTestId('profile-link');
		fireEvent.click(profileLink);
		expect(navigate).toHaveBeenCalledWith('/profile');
	});

	test('should call handleLogout when Logout option is clicked and navigate to /wlecome', () => {
		renderDropdown();
		const logout = screen.getByTestId('logout-option');
		fireEvent.click(logout);
		expect(handleLogout).toHaveBeenCalled();
		expect(navigate).toHaveBeenCalledWith('/home');
		expect(toggleShowAccount).toHaveBeenCalled();
	});
});
