import React from 'react';
import {render, fireEvent, screen, waitFor} from '@testing-library/react';
import {server} from '../../mocks/server.js';
import {rest} from 'msw';
import PreviewModal from './PreviewModal';

describe('PreviewModal', () => {
	const file = new Blob([''], {type: 'image/jpeg'});
	const mockImage = {
		name: 'test.jpg',
		url: 'http://example.com/test.jpg',
		data: file,
	};
	const mockHandleImageNameChange = jest.fn();
	const mockSetIsModalOpen = jest.fn();
	const mockFetchUploadedImages = jest.fn();

	it('renders correctly', () => {
		render(
			<PreviewModal
				image={mockImage}
				handleImageNameChange={mockHandleImageNameChange}
				isModalOpen={true}
				setIsModalOpen={mockSetIsModalOpen}
				fetchUploadedImages={mockFetchUploadedImages}
			/>,
		);
		expect(screen.getByTestId('preview-modal-form')).toBeInTheDocument();
		expect(screen.getByText('Image name')).toBeInTheDocument();
		expect(screen.getByRole('img')).toHaveAttribute('src', mockImage.url);
	});

	it('handles image name change', () => {
		render(
			<PreviewModal
				image={mockImage}
				handleImageNameChange={mockHandleImageNameChange}
				isModalOpen={true}
				setIsModalOpen={mockSetIsModalOpen}
				fetchUploadedImages={mockFetchUploadedImages}
			/>,
		);
		const newName = 'New Image Name';
		const input = screen.getByLabelText('Image name');
		fireEvent.change(input, {target: {value: newName}});
		expect(mockHandleImageNameChange).toHaveBeenCalledTimes(1);
	});

	it('shows success message and fetches updated images on successful upload', async () => {
		render(
			<PreviewModal
				image={mockImage}
				handleImageNameChange={mockHandleImageNameChange}
				isModalOpen={true}
				setIsModalOpen={mockSetIsModalOpen}
				fetchUploadedImages={mockFetchUploadedImages}
			/>,
		);
		const form = screen.getByTestId('preview-modal-form');
		fireEvent.submit(form);
		await waitFor(() => {
			expect(
				screen.getByText('Image Uploaded successfully'),
			).toBeInTheDocument();
		});
		expect(mockFetchUploadedImages).toHaveBeenCalledTimes(1);
		expect(screen.getByRole('button', {name: 'Upload'})).toBeDisabled();
		expect(screen.getByLabelText('Image name')).toBeDisabled();
	});

	it('shows error message and when image upload fails', async () => {
		server.use(
			rest.post(
				`${process.env.REACT_APP_PROXY_URL}/api/admin/upload`,
				(req, res, ctx) => {
					return res(
						ctx.status(500),
						ctx.json({
							message: 'Image Upload Failed, try again later',
						}),
					);
				},
			),
		);
		render(
			<PreviewModal
				image={mockImage}
				handleImageNameChange={mockHandleImageNameChange}
				isModalOpen={true}
				setIsModalOpen={mockSetIsModalOpen}
				fetchUploadedImages={mockFetchUploadedImages}
			/>,
		);
		const form = screen.getByTestId('preview-modal-form');
		fireEvent.submit(form);
		await waitFor(() => {
			expect(
				screen.getByText('Image Upload Failed, try again later'),
			).toBeInTheDocument();
		});
		expect(mockFetchUploadedImages).not.toHaveBeenCalled();
		expect(screen.getByRole('button', {name: 'Upload'})).not.toBeDisabled();
		expect(screen.getByLabelText('Image name')).not.toBeDisabled();
	});
});
