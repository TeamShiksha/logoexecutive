import React from 'react';
import {render, screen} from '@testing-library/react';
import VerificationState from './VerificationState';
import {BrowserRouter} from 'react-router-dom';

describe('VerificationState component', () => {
	test('renders loading state', () => {
		render(
			<BrowserRouter>
				<VerificationState loading={true} />
			</BrowserRouter>,
		);
		const loadingElement = screen.getByText('Loading...');
		expect(loadingElement).toBeInTheDocument();
	});
	test('renders error state', () => {
		render(
			<BrowserRouter>
				<VerificationState
					loading={false}
					errorMsg={'error message'}
					isSuccess={false}
				/>
			</BrowserRouter>,
		);
		const errorIcon = screen.getByTestId('error-icon');
		expect(errorIcon).toBeInTheDocument();
	});
	test('renders success state', () => {
		render(
			<BrowserRouter>
				<VerificationState
					loading={false}
					isSuccess={true}
					successMessage={'Email has been verified successfully'}
				/>
			</BrowserRouter>,
		);
		const successIcon = screen.getByTestId('success-icon');
		expect(successIcon).toBeInTheDocument();

		const loadingElement = screen.getByText(
			'Email has been verified successfully',
		);
		expect(loadingElement).toBeInTheDocument();

		const countdownElement = screen.getByText(/Redirecting you in \d+s .../i);
		expect(countdownElement).toBeInTheDocument();
	});
});
