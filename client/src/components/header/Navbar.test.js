import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {BrowserRouter} from 'react-router-dom';
import Navbar from './Navbar';

describe('Navbar', () => {
	it('renders navbar with correct items', () => {
		const navbarItems = [
			{name: 'Home', link: '/'},
			{name: 'About', link: '/about'},
			{name: 'Contact', link: '/contact'},
		];

		render(
			<BrowserRouter>
				<Navbar navbarItems={navbarItems} />
			</BrowserRouter>,
		);

		navbarItems.forEach((item) => {
			const navLink = screen.getByRole('link', {name: item.name});
			expect(navLink).toBeDefined();
			expect(navLink).toHaveAttribute('href', item.link);
		});
	});
});
