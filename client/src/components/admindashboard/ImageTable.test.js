import React from 'react';
import {render, screen} from '@testing-library/react';

import ImageTable from './ImageTable';
import {imageTableHeadings} from '../../constants';

describe('Image Table Component', () => {
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
		const imageRows = screen.queryAllByRole('row', {container: tableElement});
		expect(imageRows).toHaveLength(1);
	});

	test('All Images should be listed if images are provided', () => {
		const mockImages = [
			{
				index: 1,
				name: 'Google.png',
				createDate: 'Dec 18, 2023',
				updateDate: 'Dec 27, 2023',
			},
			{
				index: 2,
				name: 'Meta.png',
				createDate: 'Dec 1, 2023',
				updateDate: 'Dec 31, 2023',
			},
		];
		render(<ImageTable uploadedImages={mockImages} />);
		const tableElement = screen.getByRole('table');
		const imageRows = screen.queryAllByRole('row', {container: tableElement});
		const imagesLength = mockImages.length;
		expect(imageRows).toHaveLength(imagesLength + 1);
	});
});
