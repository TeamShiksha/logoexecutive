import {render, screen, fireEvent} from '@testing-library/react';
import Footer from './Footer';
import {BrowserRouter} from 'react-router-dom';
describe('Footer', () => {
	it('should render the footer component', () => {
		const windowSpy = jest.spyOn(window, 'open');
		render(
			<BrowserRouter>
				<Footer />
			</BrowserRouter>,
		);
		expect(screen.getByText('Welcome')).toBeInTheDocument();
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
