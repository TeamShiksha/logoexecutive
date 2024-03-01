import {render, screen} from '@testing-library/react';
import Header from './Header';
import * as router from 'react-router';
import {BrowserRouter} from 'react-router-dom';

describe('Header', () => {
	const mockLoggedOutUser = jest.fn();
	const navigate = jest.fn();

	beforeEach(() => {
		jest.spyOn(router, 'useNavigate').mockImplementation(() => navigate);
	});
	test('should show logo', () => {
		render(
			<BrowserRouter>
				<Header user='test' logoutUser={mockLoggedOutUser} />
			</BrowserRouter>,
		);
		const image = screen.getByAltText('brand logo');
		expect(image).toBeInTheDocument();
		expect(screen.getByText('LogoExecutive')).toBeInTheDocument();
	});

	test('should show different navigation links when user is logged in', () => {
		render(
			<BrowserRouter>
				<Header user='test' logoutUser={mockLoggedOutUser} />
			</BrowserRouter>,
		);
		expect(screen.getByText('Dashboard')).toBeInTheDocument();
		expect(screen.getByText('Docs')).toBeInTheDocument();
		expect(screen.getByText('Pricing')).toBeInTheDocument();
		expect(screen.getByText('About')).toBeInTheDocument();
		expect(screen.getByText('Logout')).toBeInTheDocument();
	});

	test('should show different navigation links when user is logged out', () => {
		render(
			<BrowserRouter>
				<Header user='' logoutUser={mockLoggedOutUser} />
			</BrowserRouter>,
		);
		expect(screen.getByText('Home')).toBeInTheDocument();
		expect(screen.getByText('Demo')).toBeInTheDocument();
		expect(screen.getByText('Pricing')).toBeInTheDocument();
		expect(screen.getByText('About')).toBeInTheDocument();
		expect(screen.getByText('Get Started')).toBeInTheDocument();
	});
});
