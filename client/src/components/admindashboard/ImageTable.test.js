import React from 'react';
import {render, screen} from '@testing-library/react';

import ImageTable from './ImageTable';
import {imageTableHeadings} from '../../constants';

describe('Image Table Component', () => {
	const mockImages = [
		{
			imageId: 1,
			domainame: 'Google.png',
			createdAt: 'Dec 18, 2023',
			updatedAt: 'Dec 27, 2023',
		},
		{
			imageId: 2,
			domainame: 'Meta.png',
			createdAt: 'Dec 1, 2023',
			updatedAt: 'Dec 31, 2023',
		},
	];
	const errorText = 'Error : Something went wrong';
	const noImagesText =
		'Your uploaded images will be visible here, drag and drop or click to upload.';

	test('Image table should render properly with all headings', () => {
		render(<ImageTable uploadedImages={[]} />);
		for (let heading of imageTableHeadings) {
			const headingElement = screen.getByText(heading);
			expect(headingElement).toBeInTheDocument();
			expect(headingElement).toBeVisible();
		}
	});

	test('Images should not be listed if there are no images', () => {
		render(<ImageTable uploadedImages={[]} />);
		const tableElement = screen.getByRole('table');
		const noImagesText =
			'Your uploaded images will be visible here, drag and drop or click to upload.';
		const imageRows = screen.queryAllByRole('row', {container: tableElement});
		expect(imageRows).toHaveLength(2);
		expect(screen.getByText(noImagesText)).toBeInTheDocument();
	});

	test('All Images should be listed if images are provided', () => {
		render(<ImageTable uploadedImages={mockImages} />);
		const tableElement = screen.getByRole('table');
		const imageRows = screen.queryAllByRole('row', {container: tableElement});
		const imagesLength = mockImages.length;
		expect(imageRows).toHaveLength(imagesLength + 1);
		expect(screen.queryByText(noImagesText)).not.toBeInTheDocument();
		expect(screen.queryByText(errorText)).not.toBeInTheDocument();
		expect(screen.getByText('Google.png')).toBeInTheDocument();
		expect(screen.getByText('Meta.png')).toBeInTheDocument();
	});

	test('Error message is shown properly', () => {
		render(
			<ImageTable uploadedImages={[]} errorMessage='Something went wrong' />,
		);
		const tableElement = screen.getByRole('table');
		const imageRows = screen.queryAllByRole('row', {container: tableElement});
		expect(imageRows).toHaveLength(2);
		expect(screen.getByText(errorText)).toBeInTheDocument();
		expect(screen.queryByText(noImagesText)).not.toBeInTheDocument();
	});
});
