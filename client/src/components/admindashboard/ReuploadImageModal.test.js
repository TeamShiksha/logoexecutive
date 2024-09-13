import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ReuploadImageModal from './ReuploadImageModal';

global.URL.createObjectURL = jest.fn();

describe('Drag and Drop Component', () => {
	const mockFile = new File(['fileContent'], 'image.jpg', {type: 'image/jpeg'});
	const mockTextFile = new File(['fileContent'], 'image.txt', {type: 'text'});
	const mockFetchUploadedImages = jest.fn();

	test('Drag and Drop component should be rendered properly', () => {
		render(
			<ReuploadImageModal fetchUploadedImages={mockFetchUploadedImages} />,
		);
		expect(
			screen.getByText('Drag and drop your image here or click to browse.'),
		).toBeInTheDocument();
		const imageUploadElement = screen.getByTestId('file-upload');
		expect(imageUploadElement).toBeInTheDocument();
	});

	test('Uploading file in the input should work as expected', async () => {
		render(
			<ReuploadImageModal fetchUploadedImages={mockFetchUploadedImages} />,
		);
		const imageUploadElement = screen.getByTestId('file-upload');
		expect(imageUploadElement).toBeInTheDocument();
		userEvent.upload(imageUploadElement, mockFile);
		expect(imageUploadElement.files[0].name).toBe('image.jpg');
		expect(imageUploadElement.files[0].type).toBe('image/jpeg');
		expect(screen.queryByTestId('image-error')).toBeNull();
		const fileName = screen.getByRole('button', {name: 'Upload'});
		expect(fileName).toBeInTheDocument();
		expect(screen.getByTestId('image-preview')).toBeInTheDocument();
	});

	test('Drag over and check if the text changes', () => {
		render(
			<ReuploadImageModal fetchUploadedImages={mockFetchUploadedImages} />,
		);
		const dragArea = screen.getByTestId('drag-area');
		const dataTransfer = {dropEffect: ''};
		fireEvent.dragOver(dragArea, {dataTransfer});
		expect(screen.getByText('Yes, drop here')).toBeInTheDocument();
		fireEvent.dragLeave(dragArea, {dataTransfer});
		expect(
			screen.getByText('Drag and drop your image here or click to browse.'),
		).toBeInTheDocument();
	});

	test('Drag and Drop functionality of image should work as expected', () => {
		render(
			<ReuploadImageModal fetchUploadedImages={mockFetchUploadedImages} />,
		);
		expect(
			screen.getByText('Drag and drop your image here or click to browse.'),
		).toBeInTheDocument();
		const dragArea = screen.getByTestId('drag-area');
		const dataTransfer = {files: [mockFile]};
		fireEvent.drop(dragArea, {dataTransfer});
		expect(screen.queryByTestId('image-error')).toBeNull();
		const fileName = screen.getByRole('button', {name: 'Upload'});
		expect(fileName).toBeInTheDocument();
		expect(screen.getByTestId('image-preview')).toBeInTheDocument();
	});

	test('Error message should be shown for wrong type of file', () => {
		render(
			<ReuploadImageModal fetchUploadedImages={mockFetchUploadedImages} />,
		);
		const imageUploadElement = screen.getByTestId('file-upload');
		expect(imageUploadElement).toBeInTheDocument();
		userEvent.upload(imageUploadElement, mockTextFile);
		expect(screen.getByTestId('image-error')).toBeInTheDocument();
		expect(
			screen.getByText('Please select jpg,png,svg file. You chose a txt file.'),
		).toBeInTheDocument();
	});

	test('revokeObjectURL is called on component unmount', () => {
		const mockCreateObjectURL = jest.fn(() => 'https://image.com/1.jpg');
		const mockRevokeObjectURL = jest.fn();
		global.URL.createObjectURL = mockCreateObjectURL;
		global.URL.revokeObjectURL = mockRevokeObjectURL;
		const {unmount} = render(
			<ReuploadImageModal fetchUploadedImages={mockFetchUploadedImages} />,
		);
		const imageUploadElement = screen.getByTestId('file-upload');
		const mockFile = new File(['fileContent'], 'image.jpg', {
			type: 'image/jpeg',
		});
		userEvent.upload(imageUploadElement, mockFile);
		expect(mockCreateObjectURL).toHaveBeenCalledWith(mockFile);
		unmount();
		expect(mockRevokeObjectURL).toHaveBeenCalledWith('https://image.com/1.jpg');
	});

	test('No action is taken if no files are selected', () => {
		render(
			<ReuploadImageModal fetchUploadedImages={mockFetchUploadedImages} />,
		);
		const fileInput = screen.getByTestId('file-upload');
		fireEvent.change(fileInput, {target: {files: []}});
		const modal = screen.queryByTestId('preview-modal');
		expect(modal).not.toBeInTheDocument();
		expect(mockFetchUploadedImages).not.toHaveBeenCalled();
	});

	test('File name should be updated correctly', () => {
		render(
			<ReuploadImageModal fetchUploadedImages={mockFetchUploadedImages} />,
		);
		const fileInput = screen.getByTestId('file-upload');
		const newFile = new File(['content'], 'newImage.jpg', {type: 'image/jpeg'});
		fireEvent.change(fileInput, {target: {files: [newFile]}});
		const inputElement = screen.getByLabelText('Image name');
		fireEvent.change(inputElement, {target: {value: 'updatedImage.jpg'}});
		expect(inputElement.value).toBe('updatedImage.jpg');
	});
});
