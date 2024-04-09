import React from 'react';
import {render, screen, history} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import ResetPasswordSuccessCard from './ResetPasswordSuccessCard';

describe('ResetPasswordSuccessCard component', () => {
	it('renders success message and link to sign in page', () => {
		render(
			<MemoryRouter>
				<ResetPasswordSuccessCard />
			</MemoryRouter>,
		);
		expect(screen.getByText('Password Reset Successful')).toBeInTheDocument();
		expect(
			screen.getByText(
				'Your password has been successfully reset. You can now sign in with your new password.',
			),
		).toBeInTheDocument();
		const linkToSignIn = screen.getByRole('link', {name: 'Return to Sign In'});
		expect(linkToSignIn).toBeInTheDocument();
		expect(linkToSignIn).toHaveAttribute('href', '/signin');
	});

	it('navigates to sign in page when link is clicked', () => {
		render(
			<MemoryRouter>
				<ResetPasswordSuccessCard />
			</MemoryRouter>,
			{history},
		);
		const linkToSignIn = screen.getByRole('link', {name: 'Return to Sign In'});
		linkToSignIn.click();
		expect(window.location.pathname).toBe('/');
	});
});
