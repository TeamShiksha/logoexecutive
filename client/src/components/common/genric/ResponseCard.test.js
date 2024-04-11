import React from 'react';
import {render, screen, history} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import ResponseCard from './ResponseCard';

describe('ResponseCard component', () => {
	it('renders success message and link to sign in page', () => {
		render(
			<MemoryRouter>
				<ResponseCard />
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
});
