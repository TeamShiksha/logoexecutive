import React from 'react';
import {render, screen, waitFor} from '@testing-library/react';
import {BrowserRouter, MemoryRouter, Route, Routes} from 'react-router-dom';
import Verification from './Verification';

describe('Verification component', () => {
	test('renders VerificationStatus component when token is present', async () => {
		const token = 'exampleToken';
		const queryParams = new URLSearchParams();
		queryParams.append('token', token);
		const url = `/?${queryParams.toString()}`;
		render(
			<MemoryRouter initialEntries={[url]}>
				<Routes>
					<Route path='/' element={<Verification />} />
				</Routes>
			</MemoryRouter>,
		);
		await waitFor(() => {
			expect(screen.getByTestId('verificationStatus')).toBeInTheDocument();
		});
	});

	test('renders Error404 component if token does not exist', () => {
		const location = {search: ''};
		render(
			<BrowserRouter>
				<Verification location={location} />
			</BrowserRouter>,
		);
		expect(screen.getByText('Page not found')).toBeInTheDocument();
	});
});
