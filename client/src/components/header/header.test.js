import {describe, it, expect, vi, beforeEach} from 'vitest';
import {fireEvent, render, screen} from '@testing-library/react';
import Header from './Header';
import * as router from 'react-router';
import {BrowserRouter} from 'react-router-dom';
import {AuthContext} from '../../contexts/AuthContext';

describe('Header', () => {
	const navigate = vi.fn();
	const mockLogout = vi.fn();

	const renderHeader = (isAuthenticated) => {
		render(
			<AuthContext.Provider
				value={{
					isAuthenticated,
					logout: mockLogout,
				}}
			>
				<BrowserRouter>
					<Header />
				</BrowserRouter>
			</AuthContext.Provider>,
		);
	};

	beforeEach(() => {
		vi.spyOn(router, 'useNavigate').mockImplementation(() => navigate);
	});

	it('should show logo', () => {
		renderHeader(false);
		const image = screen.getByAltText('brand logo');
		expect(image).toBeDefined();
		expect(screen.getByText('LogoExecutive')).toBeDefined();
	});

	it('should show Dashboard, Docs, Pricing, About, and Account links when user is logged in', () => {
		renderHeader(true);
		expect(screen.getByText('Dashboard')).toBeDefined();
		expect(screen.getByText('Docs')).toBeDefined();
		expect(screen.getByText('Pricing')).toBeDefined();
		expect(screen.getByText('About')).toBeDefined();
		expect(screen.getByText('Account')).toBeDefined();
	});

	it('should show Home, Demo, Pricing, About, and Get Started links when user is logged out', () => {
		renderHeader(false);
		expect(screen.getByText('Home')).toBeDefined();
		expect(screen.getByText('Demo')).toBeDefined();
		expect(screen.getByText('Pricing')).toBeDefined();
		expect(screen.getByText('About')).toBeDefined();
		expect(screen.getByText('Get Started')).toBeDefined();
	});

	it('should navigate to /signin when Get Started button is clicked', () => {
		renderHeader(false);
		const getStartedButton = screen.getByText('Get Started');
		fireEvent.click(getStartedButton);
		expect(navigate).toHaveBeenCalledWith('/signin');
	});

	it('should toggle navigation bar visibility when burger menu is clicked', () => {
		renderHeader(false);
		global.window.innerWidth = 800;
		fireEvent.resize(global.window);
		const burgerMenu = screen.getByTestId('burger-menu');
		fireEvent.click(burgerMenu);
		expect(screen.getByRole('navigation')).toBeDefined();
		fireEvent.click(burgerMenu);
		expect(screen.queryByRole('navigation')).toBeNull();
	});

	it('should change header background on scroll', () => {
		renderHeader(false);
		expect(screen.getByRole('banner')).not.toHaveClass('bg');
		global.window.scrollY = 100;
		fireEvent.scroll(global.window);
		expect(screen.getByRole('banner')).toHaveClass('bg');
		global.window.scrollY = 0;
		fireEvent.scroll(global.window);
		expect(screen.getByRole('banner')).not.toHaveClass('bg');
	});

	it('should hide navigation bar when window width is less than 1001', () => {
		renderHeader(false);
		global.window.innerWidth = 800;
		fireEvent.resize(global.window);
		expect(screen.queryByRole('navigation')).toBeNull();
		global.window.innerWidth = 1200;
		fireEvent.resize(global.window);
		expect(screen.getByRole('navigation')).toBeDefined();
	});

	it('should hide navigation bar when window width is less than or equal to 1000', () => {
		renderHeader(true);
		global.window.innerWidth = 1000;
		fireEvent.resize(global.window);
		expect(screen.queryByRole('navigation')).toBeNull();
	});

	it('should handle logout when logout button is clicked', () => {
		renderHeader(true);
		fireEvent.click(screen.getByText('Account'));
		fireEvent.click(screen.getByText('Logout'));
		expect(mockLogout).toHaveBeenCalled();
	});

	it('should close the account dropdown when clicking outside of dropdown and account button', async () => {
		renderHeader(true);
		const accountButton = screen.getByText('Account');
		fireEvent.click(accountButton);
		const dropdown = screen.getByRole('list');
		expect(dropdown).toBeDefined();
		fireEvent.mouseDown(document.body);
		expect(screen.queryByRole('list')).toBeNull();
	});

	it('should keep the account dropdown open when clicking inside the dropdown', () => {
		renderHeader(true);
		const accountButton = screen.getByText('Account');
		fireEvent.click(accountButton);
		const dropdown = screen.getByRole('list');
		fireEvent.mouseDown(dropdown);
		expect(screen.getByRole('list')).toBeDefined();
	});
});
