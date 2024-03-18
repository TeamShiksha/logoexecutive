import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import DragAndDrop from './DragAndDrop';

global.URL.createObjectURL = jest.fn();

describe('Drag and Drop Component', () => {
	const mockFile = new File(['fileContent'], 'image.jpg', {type: 'image/jpeg'});
	const mockTextFile = new File(['fileContent'], 'image.txt', {type: 'text'});
	const dragFunction = jest.fn();

	test('Drag and Drop component should be rendered properly', () => {
		render(<DragAndDrop setUploadedImages={dragFunction} />);
		expect(
			screen.getByText('Drag and drop your image here or click to browse.'),
		).toBeInTheDocument();
		const imageUploadElement = screen.getByTestId('file-upload');
		expect(imageUploadElement).toBeInTheDocument();
	});

	test('Uploading file in the input should work as expected', async () => {
		render(<DragAndDrop setUploadedImages={dragFunction} />);
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
		render(<DragAndDrop setUploadedImages={dragFunction} />);
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
		render(<DragAndDrop setUploadedImages={dragFunction} />);
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
		render(<DragAndDrop setUploadedImages={dragFunction} />);
		const imageUploadElement = screen.getByTestId('file-upload');
		expect(imageUploadElement).toBeInTheDocument();
		userEvent.upload(imageUploadElement, mockTextFile);
		expect(screen.getByTestId('image-error')).toBeInTheDocument();
		expect(
			screen.getByText('Please select jpg,png,svg file. You chose a txt file.'),
		).toBeInTheDocument();
	});

	test('Click Upload after dropping image and see the success message', () => {
		render(<DragAndDrop setUploadedImages={dragFunction} />);
		const dragArea = screen.getByTestId('drag-area');
		const dataTransfer = {files: [mockFile]};
		fireEvent.drop(dragArea, {dataTransfer});
		const uploadButton = screen.getByRole('button', {name: 'Upload'});
		fireEvent.click(uploadButton);
		expect(
			screen.getByText('Image uploaded successfully.'),
		).toBeInTheDocument();
	});

	test('Upload image and then close the modal', () => {
		render(<DragAndDrop setUploadedImages={dragFunction} />);
		const dragArea = screen.getByTestId('drag-area');
		const dataTransfer = {files: [mockFile]};
		fireEvent.drop(dragArea, {dataTransfer});
		const closeButton = screen.getByTestId('modal-close');
		fireEvent.click(closeButton);
		const modalElement = screen.queryByTestId('modal-bg');
		expect(modalElement).toBeNull();
	});
});
