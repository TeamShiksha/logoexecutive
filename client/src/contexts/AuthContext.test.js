import {useContext} from 'react';
import {render, waitFor, act, screen} from '@testing-library/react';
import {AuthContext, AuthProvider} from './AuthContext';
import {server} from '../mocks/server';
import {rest} from 'msw';

const TestComponent = () => {
	const {isAuthenticated, logout} = useContext(AuthContext);
	return (
		<>
			<h1>{isAuthenticated ? 'Authenticated' : 'Not '}</h1>
			<button onClick={logout}>Logout</button>
		</>
	);
};

describe('AuthProvider', () => {
	test('should set isAuthenticated to false if JWT cookie does not exist', async () => {
		render(
			<AuthProvider>
				<TestComponent />
			</AuthProvider>,
		);

		await waitFor(() => {
			expect(screen.getByText('Not')).toBeInTheDocument();
		});
	});

	test('should set isAuthenticated to true if JWT cookie exists', async () => {
		Object.defineProperty(document, 'cookie', {
			value: 'jwt=sdactivedsfdsfds',
		});

		render(
			<AuthProvider>
				<TestComponent />
			</AuthProvider>,
		);

		await waitFor(() => {
			expect(screen.getByText('Authenticated')).toBeInTheDocument();
		});
	});

	test('should logout the user on Logout button click', async () => {
		render(
			<AuthProvider>
				<TestComponent />
			</AuthProvider>,
		);

		const logoutButton = screen.getByText('Logout');
		await act(async () => {
			logoutButton.click();
		});

		expect(screen.getByText('Not')).toBeInTheDocument();
	});

	test('should handle error on logout', async () => {
		server.use(
			rest.get(
				`${process.env.REACT_APP_PROXY_URL}/api/auth/signout`,
				(req, res, ctx) => {
					return res(ctx.status(500));
				},
			),
		);

		const consoleSpy = jest.spyOn(console, 'error');

		render(
			<AuthProvider>
				<TestComponent />
			</AuthProvider>,
		);

		const logoutButton = screen.getByText('Logout');
		await act(async () => {
			logoutButton.click();
		});

		expect(consoleSpy).toHaveBeenCalled();
		consoleSpy.mockRestore();
	});
});
