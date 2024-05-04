import React from 'react';
import {render, screen} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import ScrollToAnchor from './ScrollToAnchor';

window.HTMLElement.prototype.scrollIntoView = jest.fn();

describe('ScrollToAnchor', () => {
	const targetElementId = 'target-element';
	it('should scroll to the target element smoothly when a hash is present in the URL', async () => {
		render(
			<MemoryRouter initialEntries={[`/#${targetElementId}`]}>
				<ScrollToAnchor />
				<div id={targetElementId}>Target element</div>
			</MemoryRouter>,
		);
		await new Promise((resolve) => setTimeout(resolve, 100));
		const targetElement = screen.getByText('Target element');
		expect(targetElement.scrollIntoView).toHaveBeenCalledTimes(1);
		expect(targetElement).toBeVisible();
	});

	it('should not scroll if there is no hash in the URL', () => {
		render(
			<MemoryRouter>
				<ScrollToAnchor />
				<div id={targetElementId}>Target element</div>
			</MemoryRouter>,
		);
		const targetElement = screen.getByText('Target element');
		expect(targetElement.scrollIntoView).not.toHaveBeenCalled();
	});
});
