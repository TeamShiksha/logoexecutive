import {fireEvent, render, screen} from '@testing-library/react';

import * as router from 'react-router';
import NotFound from './NotFound';

describe('Page Not Found test', () => {
	const navigate = jest.fn();

	const renderNotFound = () => {
		render(<NotFound></NotFound>);
	};

	beforeEach(() => {
		jest.spyOn(router, 'useNavigate').mockImplementation(() => navigate);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	test('should show logo', () => {
		renderNotFound();
		const image = screen.getByAltText('error');
		expect(image).toBeInTheDocument();
		expect(screen.getByText('Oops! Page Not Found')).toBeInTheDocument();
	});

	test('should navigate to /home when clicked on go to homepage', () => {
		renderNotFound();
		const logout = screen.getByText('Go to homepage');
		fireEvent.click(logout);
		expect(navigate).toHaveBeenCalledWith('/home');
	});
});
