import {fireEvent, render, screen} from '@testing-library/react';
import Home from './Home';

describe('Welcome Page', () => {
	const renderWelcomePage = () => {
		return render(<Home />);
	};

	it('should render Hero Section', () => {
		renderWelcomePage();
		expect(
			screen.getByText(
				'Empower Your Branding: Logo Executive Where Logos Shine in Every Size',
			),
		).toHaveClass('hero-tagline');
		expect(screen.getByTestId('hero-description')).toBeInTheDocument();
		expect(
			screen.getByText(/Logo Executive is your partner in logo exploration/),
		).toBeInTheDocument();
		expect(screen.getByAltText('hero')).toBeInTheDocument();
	});

	it('should render Demo Section', () => {
		renderWelcomePage();
		expect(screen.getByText('Try it now')).toHaveClass('demo-heading');
		expect(
			screen.getByText(/Enter the name of a brand or the URL of a website/i),
		).toHaveClass('demo-input-description');
		const input = screen.getByLabelText('Brand name');
		expect(input).toBeInTheDocument();
		fireEvent.change(input, {target: {value: 'google'}});
		expect(input).toHaveValue('google');
	});

	it('should render FAQ Section', () => {
		renderWelcomePage();
		expect(screen.getByText('Frequently Asked Questions')).toHaveClass(
			'faqs-heading',
		);
		expect(screen.getByText('How to create API Keys ?')).toHaveClass(
			'accordion-title',
		);
		expect(screen.getByText(/Visit the dashboard page/i)).toBeInTheDocument();
	});
});
