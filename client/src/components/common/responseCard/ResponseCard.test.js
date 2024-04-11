import React from 'react';
import {render, screen} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import ResponseCard from './ResponseCard';

describe('ResponseCard component', () => {
	it('renders success message and link to sign in page', () => {
		render(
			<MemoryRouter>
				<ResponseCard
					countdown={3}
					title='Password Reset Successful'
					message='Your password has been successfully reset. You can now sign in with your new password.'
				/>
			</MemoryRouter>,
		);
		expect(screen.getByText('Password Reset Successful')).toBeInTheDocument();
		expect(
			screen.getByText(
				'Your password has been successfully reset. You can now sign in with your new password.',
			),
		).toBeInTheDocument();
		const linkToSignIn = screen.getByText('Redirecting to sign in');
		expect(linkToSignIn).toBeInTheDocument();
	});
});
