// verification.test.js
import React from 'react';
import {MemoryRouter, Routes, Route} from 'react-router-dom';
import {render, waitFor, screen} from '@testing-library/react';
import {afterAll, beforeEach, describe, expect, it, vi} from 'vitest';
import Home from '../home/Home';
import Verification from './Verification';
import * as router from 'react-router';
import {AuthContext} from '../../contexts/AuthContext';

describe('VerificationStatus Component', () => {
	const navigate = vi.fn();

	beforeEach(() => {
		vi.spyOn(router, 'useNavigate').mockImplementation(() => navigate);
	});

	afterAll(() => {
		vi.restoreAllMocks();
	});

	const renderWithAuthContext = (ui, {isAuthenticated = false} = {}) => {
		return render(
			<AuthContext.Provider value={{isAuthenticated}}>
				{ui}
			</AuthContext.Provider>,
		);
	};

	it('should navigate to welcome page when token is not provided', async () => {
		const url = `/verify`;

		renderWithAuthContext(
			<MemoryRouter initialEntries={[url]}>
				<Routes>
					<Route path='/verify' element={<Verification />} />
					<Route path='/home' element={<Home />} />
				</Routes>
			</MemoryRouter>,
		);

		await waitFor(() => {
			expect(navigate).not.toHaveBeenCalled();
		});

		setTimeout(() => {
			expect(navigate).toHaveBeenCalledWith('/home');
		}, 3000);

		expect(screen.getByTestId('home-container')).toBeInTheDocument();
	});

	it('renders "Verification successful" message when token is valid', async () => {
		const token = 'exampleToken';
		const queryParams = new URLSearchParams();
		queryParams.append('token', token);
		const url = `/verify?${queryParams.toString()}`;

		renderWithAuthContext(
			<MemoryRouter initialEntries={[url]}>
				<Routes>
					<Route path='/verify' element={<Verification />} />
					<Route path='/home' element={<Home />} />
				</Routes>
			</MemoryRouter>,
			{isAuthenticated: true},
		);

		await waitFor(() => {
			expect(screen.getByText('Verification successful')).toBeInTheDocument();
		});
	});

	it('renders error message when token is invalid', async () => {
		const token = 'malformedToken';
		const queryParams = new URLSearchParams();
		queryParams.append('token', token);
		const url = `/verify?${queryParams.toString()}`;

		renderWithAuthContext(
			<MemoryRouter initialEntries={[url]}>
				<Routes>
					<Route path='/verify' element={<Verification />} />
				</Routes>
			</MemoryRouter>,
		);

		await waitFor(() => {
			expect(screen.getByText('Token Expired')).toBeInTheDocument();
		});
	});
});
