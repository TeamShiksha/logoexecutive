import React from 'react';
import {render, screen} from '@testing-library/react';
import ResponseCard from './ResponseCard';

describe('ResponseCard Component', () => {
	const mockIcon = <svg />;

	it('renders with required props', () => {
		render(
			<ResponseCard
				title='Password Reset Successful'
				message='Your password has been successfully reset. You can now sign in with your new password.'
				Icon={mockIcon}
			/>,
		);

		expect(screen.getByText('Password Reset Successful')).toBeInTheDocument();
		expect(
			screen.getByText(
				'Your password has been successfully reset. You can now sign in with your new password.',
			),
		).toBeInTheDocument();
	});

	it('renders countdown when countdown prop is provided', () => {
		render(
			<ResponseCard
				title='Redirecting...'
				message='Please wait.'
				Icon={mockIcon}
				countdown={3}
				redirectTo='home page'
			/>,
		);

		expect(screen.getByText('Redirecting...')).toBeInTheDocument();
		expect(screen.getByText('Please wait.')).toBeInTheDocument();
		expect(screen.getByText('Redirecting to home page')).toBeInTheDocument();
		expect(screen.getByText('3')).toBeInTheDocument();
	});
});
