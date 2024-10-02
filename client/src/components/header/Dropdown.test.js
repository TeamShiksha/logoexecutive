import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {fireEvent, render, screen} from '@testing-library/react';
import {BrowserRouter} from 'react-router-dom';
import Dropdown from './Dropdown';
import {AuthContext} from '../../contexts/AuthContext';
import * as router from 'react-router';

describe('Dropdown test', () => {
	const navigate = vi.fn();
	const mockLogout = vi.fn();
	const toggleShowAccount = vi.fn();
	const handleLogout = vi.fn();

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
		vi.spyOn(router, 'useNavigate').mockImplementation(() => navigate);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it('renders without crashing', () => {
		renderDropdown();
		expect(screen.getByText('Profile')).toBeDefined();
		expect(screen.getByText('Logout')).toBeDefined();
	});

	it('should navigate to /profile', () => {
		renderDropdown();
		const profileLink = screen.getByTestId('profile-link');
		fireEvent.click(profileLink);
		expect(navigate).toHaveBeenCalledWith('/profile');
	});

	it('should call handleLogout when Logout option is clicked and navigate to /home', () => {
		renderDropdown();
		const logout = screen.getByTestId('logout-option');
		fireEvent.click(logout);
		expect(handleLogout).toHaveBeenCalled();
		expect(navigate).toHaveBeenCalledWith('/home');
		expect(toggleShowAccount).toHaveBeenCalled();
	});
});
