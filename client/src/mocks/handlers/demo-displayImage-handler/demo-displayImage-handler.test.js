import {rest} from 'msw';
import {server} from '../../server';
import {render, screen, fireEvent} from '@testing-library/react';
import Demo from '../../../components/demo/Demo';
import {AuthContext} from '../../../contexts/AuthContext';
import {UserContext} from '../../../contexts/UserContext';
import {describe, it, expect} from 'vitest';

const renderWithContext = (
	isAuthenticated = false,
	userData = {userId: 1, name: 'Test User'},
) => {
	return render(
		<AuthContext.Provider value={{isAuthenticated}}>
			<UserContext.Provider value={{userData}}>
				<Demo />
			</UserContext.Provider>
		</AuthContext.Provider>,
	);
};

describe('MSW handler - /api/public/logo', () => {
	it('should return the logo URL for a valid domain', async () => {
		renderWithContext();

		const input = screen.getByLabelText(/Brand name/i);
		const button = screen.getByRole('button', {name: /go/i});

		fireEvent.change(input, {target: {value: 'google'}});
		fireEvent.click(button);

		const image = await screen.findByAltText(/logo/i);
		expect(image).toHaveAttribute('src', 'http://localhost/google.png');
	});

	it('should return 422 if domain is missing', async () => {
		server.use(
			rest.get('/api/public/logo', (req, res, ctx) =>
				res(
					ctx.status(422),
					ctx.json({statusCode: 422, message: 'Brand Name is required'}),
				),
			),
		);

		renderWithContext();

		const button = screen.getByRole('button', {name: /go/i});
		fireEvent.click(button);

		const error = await screen.findByRole('alert');
		expect(error).toHaveTextContent('Brand Name is required');
	});

	it('should return 404 if logo is not available', async () => {
		let apiResponse;

		server.use(
			rest.get('/api/public/logo', (req, res, ctx) => {
				apiResponse = {
					status: 404,
					body: {statusCode: 404, message: 'Logo not available'},
				};
				return res(ctx.status(404), ctx.json(apiResponse.body));
			}),
		);

		renderWithContext();

		const input = screen.getByLabelText(/Brand name/i);
		const button = screen.getByRole('button', {name: /go/i});

		fireEvent.change(input, {target: {value: 'nonexistent'}});
		fireEvent.click(button);

		const error = await screen.findByText('Logo not available');

		expect(error).toBeInTheDocument();
	});
});
