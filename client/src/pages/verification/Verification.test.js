import React from 'react';
import {MemoryRouter, Routes, Route} from 'react-router-dom';
import {render, waitFor, screen, act} from '@testing-library/react';
import {useApi} from '../../hooks/useApi';
import Home from '../welcome/Home';
import Verification from './Verification';

jest.mock('../../hooks/useApi');

describe('VerificationStatus Component', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('should nvigate to welcome page when token is not provided', async () => {
		useApi.mockReturnValue({
			errorMsg: null,
			makeRequest: jest.fn(),
			isSuccess: true,
			loading: false,
		});
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
		useApi.mockReturnValue({
			errorMsg: null,
			makeRequest: jest.fn(),
			isSuccess: true,
			loading: false,
			data: {
				message: 'Verification successful',
			},
		});
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
		useApi.mockReturnValue({
			errorMsg: 'Token Expired',
			makeRequest: jest.fn(),
			isSuccess: false,
			loading: false,
		});

		const token = 'exampleToken';
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
