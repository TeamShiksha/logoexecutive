import React from 'react';
import {render, screen} from '@testing-library/react';
import {BrowserRouter} from 'react-router-dom'; // BrowserRouter allows testing components that use React Router components without needing a full router setup
import Navbar from './Navbar';

test('renders navbar with correct items', () => {
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
		expect(navLink).toHaveAttribute('href', item.link);
	});
});
