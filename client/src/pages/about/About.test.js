import React from 'react';
import {render, screen} from '@testing-library/react';
import About from './About';
import {BrowserRouter} from 'react-router-dom';
import {AuthContext} from '../../contexts/AuthContext';

describe('About Component', () => {
	const renderSignincard = () => {
		render(
			<AuthContext.Provider value={false}>
				<BrowserRouter>
					<About />
				</BrowserRouter>
			</AuthContext.Provider>,
		);
	};

	it('renders all sections with correct headings and paragraphs', () => {
		renderSignincard();
		const journeyHeading = screen.getByText('Journey');
		const journeyParagraph = screen.getByText(
			/LogoExecutive started its journey/i,
		);
		expect(journeyHeading).toBeInTheDocument();
		expect(journeyParagraph).toBeInTheDocument();

		const purposeHeading = screen.getByText('Purpose and Goals');
		const purposeParagraph = screen.getByText(
			/At LogoExecutive, our purpose is clear/i,
		);
		expect(purposeHeading).toBeInTheDocument();
		expect(purposeParagraph).toBeInTheDocument();

		const teamHeading = screen.getByText('Introduction to the Team');
		const teamParagraph = screen.getByText(
			/Behind our exceptional services lies a team/i,
		);
		expect(teamHeading).toBeInTheDocument();
		expect(teamParagraph).toBeInTheDocument();

		const offeringsHeading = screen.getByText('Offerings');
		const offeringsParagraph = screen.getByText(
			/At LogoExecutive, we offer a comprehensive range of services/i,
		);
		expect(offeringsHeading).toBeInTheDocument();
		expect(offeringsParagraph).toBeInTheDocument();
	});

	it('renders Contactus component', () => {
		renderSignincard();
		const contactusComponent = screen.getByText('Contact us');
		expect(contactusComponent).toBeInTheDocument();
	});

	it('does not render non-existent sections', () => {
		renderSignincard();
		const nonExistentHeading = screen.queryByText('Non-existent Section');
		expect(nonExistentHeading).not.toBeInTheDocument();
	});

	it('renders the sections in the correct order', () => {
		renderSignincard();
		const sectionHeadings = screen.getAllByRole('heading', {level: 2});
		expect(sectionHeadings[0]).toHaveTextContent('Journey');
		expect(sectionHeadings[1]).toHaveTextContent('Purpose and Goals');
		expect(sectionHeadings[2]).toHaveTextContent('Introduction to the Team');
		expect(sectionHeadings[3]).toHaveTextContent('Offerings');
	});

	it('renders paragraphs with appropriate content', () => {
		renderSignincard();
		const journeyParagraph = screen.getByText(
			/LogoExecutive started its journey/i,
		);
		const purposeParagraph = screen.getByText(
			/At LogoExecutive, our purpose is clear/i,
		);
		const teamParagraph = screen.getByText(
			/Behind our exceptional services lies a team/i,
		);
		const offeringsParagraph = screen.getByText(
			/At LogoExecutive, we offer a comprehensive range of services/i,
		);
		expect(journeyParagraph).toBeInTheDocument();
		expect(purposeParagraph).toBeInTheDocument();
		expect(teamParagraph).toBeInTheDocument();
		expect(offeringsParagraph).toBeInTheDocument();
	});
});