import {render, screen, waitFor} from '@testing-library/react';
import {describe, test, expect} from 'vitest';
import {UserProvider, UserContext} from './UserContext';
import {rest} from 'msw';
import {useContext, useEffect} from 'react';
import {server} from '../mocks/server';

const TestComponent = () => {
	const {userData, loading, error, fetchUserData} = useContext(UserContext);
	useEffect(() => {
		fetchUserData();
	}, []);

	if (loading) return <div>Loading...</div>;
	if (error) return <div>Failed to fetch user data</div>;
	return <div>{userData?.firstName}</div>;
};

describe('UserProvider', () => {
	test('should fetch user data', async () => {
		render(
			<UserProvider>
				<TestComponent />
			</UserProvider>,
		);

		await waitFor(() => {
			expect(screen.getByText('Anoop')).toBeInTheDocument();
		});
	});

	test('should handle error', async () => {
		server.use(
			rest.get('/api/user/data', (req, res, ctx) => {
				return res(ctx.status(500));
			}),
		);

		render(
			<UserProvider>
				<TestComponent />
			</UserProvider>,
		);

		await waitFor(() => {
			expect(screen.getByText('Failed to fetch user data')).toBeInTheDocument();
		});
	});
});
