import React from 'react';
import {MemoryRouter, Routes, Route} from 'react-router-dom';
import {render, waitFor, screen} from '@testing-library/react';
import Home from '../home/Home';
import Verification from './Verification';
import * as router from 'react-router';

describe('VerificationStatus Component', () => {
	const navigate = jest.fn();
	beforeEach(() => {
		jest.spyOn(router, 'useNavigate').mockImplementation(() => navigate);
	});

	afterAll(() => {
		jest.restoreAllMocks();
	});

	it('should navigate to welcome page when token is not provided', async () => {
		const token = 'exampleToken';
		const queryParams = new URLSearchParams();
		queryParams.append('token', token);
		const url = `/verify`;
		render(
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
		render(
			<MemoryRouter initialEntries={[url]}>
				<Routes>
					<Route path='/verify' element={<Verification />} />
					<Route path='/home' element={<Home />} />
				</Routes>
			</MemoryRouter>,
		);
		await waitFor(() => {
			expect(screen.getByText('Verification successful')).toBeInTheDocument();
		});
	});

	it('renders error message message when token is invalid', async () => {
		const token = 'malformedToken';
		const queryParams = new URLSearchParams();
		queryParams.append('token', token);
		const url = `/verify?${queryParams.toString()}`;
		render(
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
