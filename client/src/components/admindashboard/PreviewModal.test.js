import React from 'react';
import {render, fireEvent, screen} from '@testing-library/react';
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

	it('handles form submission', () => {
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
		// expect(mockFetchUploadedImages).toHaveBeenCalledTimes(1);
		// expect(screen.getByText('upload successfully.')).toBeInTheDocument();
	});
});
