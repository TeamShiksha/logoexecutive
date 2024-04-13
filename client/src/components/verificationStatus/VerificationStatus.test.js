import React from 'react';
import {BrowserRouter} from 'react-router-dom';
import {render, waitFor, screen} from '@testing-library/react';
import VerificationStatus from './VerificationStatus';
import {useApi} from '../../hooks/useApi';

jest.mock('../../hooks/useApi');

describe('VerificationStatus Component', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('renders "Email has been verified successfully" message when token is valid', async () => {
		useApi.mockReturnValue({
			errorMsg: null,
			makeRequest: jest.fn(),
			isSuccess: true,
			loading: false,
		});

		render(
			<BrowserRouter>
				<VerificationStatus token='valid token' />
			</BrowserRouter>,
		);

		await waitFor(() => {
			expect(
				screen.getByText('Email verified successfully'),
			).toBeInTheDocument();
		});
	});

	it('renders error message message when token is invalid', async () => {
		useApi.mockReturnValue({
			errorMsg: 'Token Expired',
			makeRequest: jest.fn(),
			isSuccess: false,
			loading: false,
		});

		render(
			<BrowserRouter>
				<VerificationStatus token='invalid token' />
			</BrowserRouter>,
		);

		await waitFor(() => {
			expect(screen.getByText('Token Expired')).toBeInTheDocument();
		});
	});
});
