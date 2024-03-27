import React from 'react';
import {render, screen} from '@testing-library/react';
import HeroSection from './HeroSection';
import Banner from '../../assets/images/Banner.jpg';

describe('Hero Section Component', () => {
	test('Tag Line and description is rendered', () => {
		render(<HeroSection />);
		const taglineElements = screen.getAllByText((content, element) => {
			return content.includes('Empower Your Branding');
		});
		expect(taglineElements[0]).toBeInTheDocument();
		expect(taglineElements[0]).toHaveClass('hero-tagline');

		const tagDescriptionElements = screen.getAllByText((content, element) => {
			return content.includes(
				'Logo Executive is your partner in logo exploration',
			);
		});
		expect(tagDescriptionElements[0]).toBeInTheDocument();
		expect(tagDescriptionElements[0]).toHaveClass('hero-description');
	});

	test('Image is rendered', () => {
		render(<HeroSection />);
		const imageElement = screen.getByAltText('hero');
		expect(imageElement).toBeInTheDocument();
		expect(imageElement).toHaveAttribute('src', Banner);
	});
});
