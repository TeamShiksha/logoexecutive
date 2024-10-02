import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {fireEvent, render, screen} from '@testing-library/react';

import * as router from 'react-router';
import NotFound from './NotFound';

describe('Page Not Found test', () => {
	const navigate = vi.fn();

	const renderNotFound = () => {
		render(<NotFound></NotFound>);
	};

	beforeEach(() => {
		vi.spyOn(router, 'useNavigate').mockImplementation(() => navigate);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it('should show logo', () => {
		renderNotFound();
		const image = screen.getByAltText('error');
		expect(image).toBeDefined();
		expect(screen.getByText('Oops! Page Not Found')).toBeDefined();
	});

	it('should navigate to /home when clicked on go to homepage', () => {
		renderNotFound();
		const logout = screen.getByText('Go to homepage');
		fireEvent.click(logout);
		expect(navigate).toHaveBeenCalledWith('/home');
	});
});
