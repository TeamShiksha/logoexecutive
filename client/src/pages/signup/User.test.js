import {
	render,
	screen,
	waitForElementToBeRemoved,
} from '@testing-library/react';
import User from './User';
import {server} from '../../mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('loads and displays user', async () => {
	render(<User />);

	// Check that the component is in a loading state
	expect(screen.getByText('Loading...')).toBeInTheDocument();

	// Wait for the loading state to finish
	await waitForElementToBeRemoved(() => screen.queryByText('Loading...'));

	// Check that the user data was rendered
	expect(screen.getByText('John Doe')).toBeInTheDocument();
	expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
});
