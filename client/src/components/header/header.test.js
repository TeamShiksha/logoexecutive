import {fireEvent, render, screen} from '@testing-library/react';
import Header from './Header';
import * as router from 'react-router';
import {BrowserRouter} from 'react-router-dom';
import {AuthContext} from '../../contexts/AuthContext';

describe('Header', () => {
	const navigate = jest.fn();
	const mockLogout = jest.fn();

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
		jest.spyOn(router, 'useNavigate').mockImplementation(() => navigate);
	});

	test('should show logo', () => {
		renderHeader(false);
		const image = screen.getByAltText('brand logo');
		expect(image).toBeInTheDocument();
		expect(screen.getByText('LogoExecutive')).toBeInTheDocument();
	});

	test('should show Dashboard, Docs, Pricing, About, and Account links when user is logged in', () => {
		renderHeader(true);
		expect(screen.getByText('Dashboard')).toBeInTheDocument();
		expect(screen.getByText('Docs')).toBeInTheDocument();
		expect(screen.getByText('Pricing')).toBeInTheDocument();
		expect(screen.getByText('About')).toBeInTheDocument();
		expect(screen.getByText('Account')).toBeInTheDocument();
	});

	test('should show Home, Demo, Pricing, About, and Get Started links when user is logged out', () => {
		renderHeader(false);
		expect(screen.getByText('Home')).toBeInTheDocument();
		expect(screen.getByText('Demo')).toBeInTheDocument();
		expect(screen.getByText('Pricing')).toBeInTheDocument();
		expect(screen.getByText('About')).toBeInTheDocument();
		expect(screen.getByText('Get Started')).toBeInTheDocument();
	});

	test('should navigate to /signin when Get Started button is clicked', () => {
		renderHeader(false);
		const getStartedButton = screen.getByText('Get Started');
		fireEvent.click(getStartedButton);
		expect(navigate).toHaveBeenCalledWith('/signin');
	});

	test('should toggle navigation bar visibility when burger menu is clicked', () => {
		renderHeader(false);
		global.window.innerWidth = 800;
		fireEvent.resize(global.window);
		const burgerMenu = screen.getByTestId('burger-menu');
		fireEvent.click(burgerMenu);
		expect(screen.getByRole('navigation')).toBeInTheDocument();
		fireEvent.click(burgerMenu);
		expect(screen.queryByRole('navigation')).toBeNull();
	});

	test('should change header background on scroll', () => {
		renderHeader(false);
		expect(screen.getByRole('banner')).not.toHaveClass('bg');
		global.window.scrollY = 100;
		fireEvent.scroll(global.window);
		expect(screen.getByRole('banner')).toHaveClass('bg');
		global.window.scrollY = 0;
		fireEvent.scroll(global.window);
		expect(screen.getByRole('banner')).not.toHaveClass('bg');
	});

	test('should hide navigation bar when window width is less than 1001', () => {
		renderHeader(false);
		global.window.innerWidth = 800;
		fireEvent.resize(global.window);
		expect(screen.queryByRole('navigation')).toBeNull();
		global.window.innerWidth = 1200;
		fireEvent.resize(global.window);
		expect(screen.getByRole('navigation')).toBeInTheDocument();
	});

	test('should hide navigation bar when window width is less than or equal to 1000', () => {
		renderHeader(true);
		global.window.innerWidth = 1000;
		fireEvent.resize(global.window);
		expect(screen.queryByRole('navigation')).toBeNull();
	});

	test('should handle logout when logout button is clicked', () => {
		renderHeader(true);
		fireEvent.click(screen.getByText('Account'));
		fireEvent.click(screen.getByText('Logout'));
		expect(mockLogout).toHaveBeenCalled();
	});

	test('should close the account dropdown when clicking outside of dropdown and account button', async () => {
		renderHeader(true);
		const accountButton = screen.getByText('Account');
		fireEvent.click(accountButton);
		const dropdown = screen.getByRole('list');
		expect(dropdown).toBeInTheDocument();
		fireEvent.mouseDown(document.body);
		expect(screen.queryByRole('list')).not.toBeInTheDocument();
	});

	test('should keep the account dropdown open when clicking inside the dropdown', () => {
		renderHeader(true);
		const accountButton = screen.getByText('Account');
		fireEvent.click(accountButton);
		const dropdown = screen.getByRole('list');
		fireEvent.mouseDown(dropdown);
		expect(screen.getByRole('list')).toBeInTheDocument();
	});
});
