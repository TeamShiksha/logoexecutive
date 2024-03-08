import React from 'react';
import {render, fireEvent, screen} from '@testing-library/react';
import PreviewModal from './PreviewModal';

describe('PreviewModal', () => {
	const mockImage = {
		name: 'test.jpg',
		url: 'http://example.com/test.jpg',
	};
	const mockHandleImageNameChange = jest.fn();
	const mockSetIsModalOpen = jest.fn();
	const mockSetIsUploadSuccessfull = jest.fn();
	const mockSetUploadedImages = jest.fn();

	it('renders correctly', () => {
		render(
			<PreviewModal
				image={mockImage}
				handleImageNameChange={mockHandleImageNameChange}
				isModalOpen={true}
				setIsModalOpen={mockSetIsModalOpen}
				isUploadSuccessfull={false}
				setIsUploadSuccessfull={mockSetIsUploadSuccessfull}
				setUploadedImages={mockSetUploadedImages}
			/>,
		);
		expect(screen.getByTestId('form')).toBeInTheDocument();
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
				isUploadSuccessfull={false}
				setIsUploadSuccessfull={mockSetIsUploadSuccessfull}
				setUploadedImages={mockSetUploadedImages}
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
				isUploadSuccessfull={true}
				setIsUploadSuccessfull={mockSetIsUploadSuccessfull}
				setUploadedImages={mockSetUploadedImages}
			/>,
		);
		const form = screen.getByTestId('form');
		fireEvent.submit(form);
		expect(mockSetIsUploadSuccessfull).toHaveBeenCalledWith(true);
		expect(mockSetUploadedImages).toHaveBeenCalledTimes(1);
		expect(
			screen.getByText('Image uploaded successfully.'),
		).toBeInTheDocument();
	});
});
