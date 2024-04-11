import React from 'react';
import {render, screen, waitFor} from '@testing-library/react';
import {BrowserRouter, MemoryRouter, Route, Routes} from 'react-router-dom';
import Verification from './Verification';
import Home from '../../pages/welcome/Home';

describe('Verification component', () => {
	test('renders VerificationStatus component when token is present', async () => {
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
			expect(screen.getByTestId('verificationStatus')).toBeInTheDocument();
		});
	});
	test('renders Home component when token is not present', async () => {
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
});
