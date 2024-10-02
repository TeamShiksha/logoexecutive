import {render, screen, fireEvent} from '@testing-library/react';
import Footer from './Footer';
import {BrowserRouter} from 'react-router-dom';
import {vi, afterEach} from 'vitest';

describe('Footer', () => {
	// Restore all mocks after each test
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('should render all footer links and handle external link clicks', () => {
		const windowSpy = vi.spyOn(window, 'open').mockImplementation(() => {});
		render(
			<BrowserRouter>
				<Footer />
			</BrowserRouter>,
		);
		expect(screen.getByText('Home')).toBeInTheDocument();
		expect(screen.getByText('Demo')).toBeInTheDocument();
		expect(screen.getByText('About')).toBeInTheDocument();
		expect(screen.getByText('Contact')).toBeInTheDocument();
		expect(
			screen.getByText(
				'Empower Your Branding: Logo Executive Where Logos Shine in Every Size',
			),
		).toBeInTheDocument();
		const brandLogo = screen.getByAltText('Brand logo');
		const teamShikshaLogo = screen.getByAltText('TeamShiksha Logo');
		expect(brandLogo).toBeInTheDocument();
		expect(teamShikshaLogo).toBeInTheDocument();
		fireEvent.click(teamShikshaLogo);
		expect(windowSpy).toHaveBeenCalledWith('https://team.shiksha', '_blank');
	});
});
