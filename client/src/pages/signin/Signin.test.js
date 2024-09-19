import React from 'react';
import {render, screen} from '@testing-library/react';
import {vi, describe, it, expect} from 'vitest';
import {MemoryRouter, Navigate} from 'react-router-dom';
import {AuthContext} from '../../contexts/AuthContext';
import Signin from './Signin';

vi.mock('react-router-dom', () => ({
	...vi.requireActual('react-router-dom'),
	Navigate: vi.fn(() => null),
}));

describe('Signin component', () => {
	const renderer = (isAuthenticated) => {
		render(
			<AuthContext.Provider value={{isAuthenticated}}>
				<MemoryRouter>
					<Signin />
				</MemoryRouter>
			</AuthContext.Provider>,
		);
	};
	it('renders Signincard when user is not authenticated', () => {
		renderer(false);
		expect(screen.getByTestId('testid-signin')).toBeInTheDocument();
	});

	it('redirects to dashboard when user is authenticated', () => {
		renderer(true);
		expect(screen.queryByTestId('testid-signin')).toBeNull();
		expect(Navigate).toHaveBeenCalledTimes(1);
		expect(Navigate).toHaveBeenCalledWith({to: '/dashboard'}, {});
	});
});
