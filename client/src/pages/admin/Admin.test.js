import {render, screen, waitFor} from '@testing-library/react';
import {rest} from 'msw';
import {server} from '../../mocks/server.js';
import AdminDashboard from './Admin.js';

describe('AdminDashboard', () => {
	it('renders the "Add Image" heading', async () => {
		render(<AdminDashboard />);
		const heading = screen.getByText('Add Image');
		expect(heading).toBeInTheDocument();
	});

	it('renders the DragAndDrop component', async () => {
		render(<AdminDashboard />);
		const dragAndDropComponent = screen.getByTestId('drag-area');
		expect(dragAndDropComponent).toBeInTheDocument();
		expect(
			screen.getByText('Drag and drop your image here or click to browse.'),
		).toBeInTheDocument();
	});

	it('renders the ImageTable component with uploaded images', async () => {
		render(<AdminDashboard />);

		await waitFor(() => {
			const imageTableRows = screen.getAllByRole('row', {exact: false});
			expect(imageTableRows).toHaveLength(3);
		});
		expect(screen.getByText('Google.png')).toBeInTheDocument();
		expect(screen.getByText('Meta.png')).toBeInTheDocument();
	});

	it('renders a message when there are no uploaded images', async () => {
		server.use(
			rest.get(
				`${process.env.REACT_APP_PROXY_URL}/api/admin/images`,
				(req, res, ctx) => {
					return res(ctx.status(200), ctx.json({data: []}));
				},
			),
		);

		render(<AdminDashboard />);
		const noImagesMessage = await screen.findByText(
			'Your uploaded images will be visible here, drag and drop or click to upload.',
		);
		expect(noImagesMessage).toBeInTheDocument();
	});

	it('renders an error message when there is an error fetching images', async () => {
		server.use(
			rest.get(
				`${process.env.REACT_APP_PROXY_URL}/api/admin/images`,
				(req, res, ctx) => {
					return res(
						ctx.status(500),
						ctx.json({message: 'Failed to fetch images'}),
					);
				},
			),
		);

		render(<AdminDashboard />);
		const errorMessage = await screen.findByText(
			'Error : Failed to fetch images',
		);
		expect(errorMessage).toBeInTheDocument();
	});

	it('calls the makeRequest function on component mount to fetch uploaded images', async () => {
		const requestSpy = jest.fn();
		server.events.on('request:start', requestSpy);

		render(<AdminDashboard />);
		await waitFor(() => {
			expect(requestSpy).toHaveBeenCalledTimes(1);
		});
		expect(requestSpy).toHaveBeenCalledWith(
			expect.objectContaining({
				url: new URL('api/admin/images', 'http://localhost'),
			}),
		);
		server.events.removeListener('request:start', requestSpy);
	});
});
