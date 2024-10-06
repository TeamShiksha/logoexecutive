import React from 'react';
import {render, screen} from '@testing-library/react';
import {vi, describe, it, expect, beforeEach} from 'vitest';
import {AuthContext} from '../../contexts/AuthContext';
import Signin from './Signin';
import {useNavigate, useLocation, Navigate} from 'react-router-dom';

vi.mock('react-router-dom', () => ({
	useNavigate: vi.fn(),
	useLocation: vi.fn(),
	Navigate: vi.fn(({to}) => null),
}));

vi.mock('../../components/signincard/Signincard', () => ({
	default: vi.fn(() => (
		<div data-testid='mock-signincard'>Mocked Signincard</div>
	)),
}));

describe('Signin component', () => {
	const mockNavigate = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		useNavigate.mockReturnValue(mockNavigate);
		useLocation.mockReturnValue({state: {}});
	});

	const renderSignin = (isAuthenticated = false) => {
		return render(
			<AuthContext.Provider
				value={{isAuthenticated, setIsAuthenticated: vi.fn()}}
			>
				<Signin />
			</AuthContext.Provider>,
		);
	};

	it('renders Signincard when user is not authenticated', () => {
		renderSignin(false);
		expect(screen.getByTestId('mock-signincard')).toBeInTheDocument();
	});

	it('redirects to dashboard when user is authenticated', () => {
		renderSignin(true);
		expect(screen.queryByTestId('mock-signincard')).not.toBeInTheDocument();
		expect(Navigate).toHaveBeenCalledWith({to: '/dashboard'}, {});
	});
});
