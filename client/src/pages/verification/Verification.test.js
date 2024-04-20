import React from 'react';
import {MemoryRouter, Routes, Route} from 'react-router-dom';
import {render, waitFor, screen} from '@testing-library/react';
import Home from '../home/Home';
import Verification from './Verification';

describe('VerificationStatus Component', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('should nvigate to welcome page when token is not provided', async () => {
		const token = 'exampleToken';
		const queryParams = new URLSearchParams();
		queryParams.append('token', token);
		const url = `/verify`;
		render(
			<MemoryRouter initialEntries={[url]}>
				<Routes>
					<Route path='/verify' element={<Verification />} />
					<Route path='/welcome' element={<Home />} />
				</Routes>
			</MemoryRouter>,
		);
		await waitFor(() => {
			expect(screen.getByTestId('home-container')).toBeInTheDocument();
		});
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
					<Route path='/welcome' element={<Home />} />
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
