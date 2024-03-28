import React from 'react';
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
			loading: false,
		});

		render(<VerificationStatus token='validToken' />);

		await waitFor(() => {
			expect(screen.getByTestId('verificationStatus')).toBeInTheDocument();
		});
		expect(
			screen.getByText('Email has been verified successfully'),
		).toBeInTheDocument();
	});

	it('renders error message when there is an error', async () => {
		const errorMessage = 'Error: Token is expired';
		useApi.mockReturnValue({
			errorMsg: errorMessage,
			makeRequest: jest.fn(),
			loading: false,
		});

		render(<VerificationStatus token='expiredToken' />);

		await waitFor(() => {
			expect(screen.getByTestId('verificationStatus')).toBeInTheDocument();
		});
		expect(screen.getByText(errorMessage)).toBeInTheDocument();
	});

	it('does not render anything while loading', async () => {
		useApi.mockReturnValue({
			errorMsg: null,
			makeRequest: jest.fn(),
			loading: true,
		});

		render(<VerificationStatus token='validToken' />);

		await waitFor(() => {
			expect(
				screen.queryByTestId('verificationStatus'),
			).not.toBeInTheDocument();
		});
	});

	it('calls makeRequest when component mounts', () => {
		const makeRequestMock = jest.fn();
		useApi.mockReturnValue({
			errorMsg: null,
			makeRequest: makeRequestMock,
			loading: true,
		});

		render(<VerificationStatus token='validToken' />);

		expect(makeRequestMock).toHaveBeenCalledTimes(1);
	});
});
