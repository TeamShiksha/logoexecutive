import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import DragAndDrop from './DragAndDrop';
global.URL.createObjectURL = jest.fn();

describe('Drag and Drop Component', () => {
	const mockFile = new File(['fileContent'], 'image.jpg', {type: 'image/jpeg'});

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
		const fileName = screen.getByRole('button', {name: 'Upload'});
		expect(fileName).toBeInTheDocument();
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
		const dataTransfer = {
			files: [mockFile],
			items: [
				{
					kind: 'file',
					type: mockFile.type,
					getAsFile: () => mockFile,
				},
			],
			types: ['Files'],
		};
		fireEvent.drop(dragArea, {dataTransfer});
		const fileName = screen.getByRole('button', {name: 'Upload'});
		expect(fileName).toBeInTheDocument();
	});
});
