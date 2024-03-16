import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import DragAndDrop from './DragAndDrop';
import AdminDashboard from '../../pages/admin/Admin';

global.URL.createObjectURL = jest.fn();

describe('Drag and Drop Component', () => {
	const mockFile = new File(['fileContent'], 'image.jpg', {type: 'image/jpeg'});
	const mockTextFile = new File(['fileContent'], 'image.txt', {type: 'text'});

	test('Drag and Drop component should be rendered properly', () => {
		const dragFunction = jest.fn();
		render(<DragAndDrop setUploadedImages={dragFunction} />);
		expect(
			screen.getByText('Drag and drop your image here or click to browse.'),
		).toBeInTheDocument();
		const imageUploadElement = screen.getByRole('file-upload');
		expect(imageUploadElement).toBeInTheDocument();
	});

	test('Uploading file in the input should work as expected', async () => {
		const dragFunction = jest.fn();
		render(<DragAndDrop setUploadedImages={dragFunction} />);
		const imageUploadElement = screen.getByRole('file-upload');
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
		const dragFunction = jest.fn();
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
		const dragFunction = jest.fn();
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
		const dragFunction = jest.fn();
		render(<DragAndDrop setUploadedImages={dragFunction} />);
		const imageUploadElement = screen.getByRole('file-upload');
		expect(imageUploadElement).toBeInTheDocument();
		userEvent.upload(imageUploadElement, mockTextFile);
		expect(screen.getByTestId('image-error')).toBeInTheDocument();
	});

	test('Click Upload after dropping image and see the success message', () => {
		const dragFunction = jest.fn();
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
		const dragFunction = jest.fn();
		render(<DragAndDrop setUploadedImages={dragFunction} />);
		const dragArea = screen.getByTestId('drag-area');
		const dataTransfer = {files: [mockFile]};
		fireEvent.drop(dragArea, {dataTransfer});
		const closeButton = screen.getByTestId('modal-close');
		fireEvent.click(closeButton);
		const modalElement = screen.queryByTestId('modal-bg');
		expect(modalElement).toBeNull();
	});

	test('Drag and Drop the image and check if the image is listed in the table', () => {
		render(<AdminDashboard />);
		var tbody = screen.getByRole('image-table-body');
		var imageRowsBeforeUpload = screen.queryAllByRole('row', {
			container: tbody,
		});
		const imagesLengthBeforeUpload = imageRowsBeforeUpload.length;
		expect(imageRowsBeforeUpload).toHaveLength(imagesLengthBeforeUpload);
		const dragArea = screen.getByTestId('drag-area');
		const dataTransfer = {files: [mockFile]};
		fireEvent.drop(dragArea, {dataTransfer});
		const uploadButton = screen.getByRole('button', {name: 'Upload'});
		fireEvent.click(uploadButton);
		expect(
			screen.getByText('Image uploaded successfully.'),
		).toBeInTheDocument();
		fireEvent.click(screen.getByTestId('component'));
		tbody = screen.getByRole('image-table-body');
		const imageRowsAfterUpload = screen.queryAllByRole('row', {
			container: tbody,
		});
		const imagesLengthAfterUpload = imagesLengthBeforeUpload + 1;
		expect(imageRowsAfterUpload).toHaveLength(imagesLengthAfterUpload);
	});
});
