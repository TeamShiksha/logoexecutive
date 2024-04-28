import React from 'react';
import {render, screen} from '@testing-library/react';
import About from './About';
import {BrowserRouter} from 'react-router-dom';
import {AuthContext} from '../../contexts/AuthContext';
import {UserContext} from '../../contexts/UserContext';

describe('About Component', () => {
	const mockUserData = {
		firstName: 'Anoop',
		lastName: 'Singh',
		email: 'aps08@gmail.com',
		userId: '99234290-a33b-40d1-a5d4-888e86d06cd1',
		userType: 'CUSTOMER',
		keys: [
			{
				keyId: '4d6544e38f5d4ad8bae546ea61e2b842',
				key: '4d6544e38f5d4ad8bae546ea61e2b842',
				usageCount: '0',
				keyDescription: 'Demo Key',
				updatedAt: new Date().toLocaleDateString('en-US', {
					day: '2-digit',
					month: 'short',
					year: 'numeric',
				}),
				createdAt: new Date().toLocaleDateString('en-US', {
					day: '2-digit',
					month: 'short',
					year: 'numeric',
				}),
			},
		],
		subscription: {
			subscriptionId: '4d6544e3-8f5d-4ad8-bae5-46ea61e2b842',
			subscriptionType: 'HOBBY',
			keyLimit: 2,
			usageLimit: 500,
			isActive: false,
			createdAt: '2024-04-11T10:24:38.501Z',
			updatedAt: '2024-04-11T10:24:38.501Z',
		},
	};
	const fetchUserData = jest.fn();
	const renderComponent = () => {
		render(
			<AuthContext.Provider
				value={{
					isAuthenticated: false,
				}}
			>
				<UserContext.Provider value={{userData: mockUserData, fetchUserData}}>
					<BrowserRouter>
						<About />
					</BrowserRouter>
				</UserContext.Provider>
			</AuthContext.Provider>,
		);
	};

	it('renders all sections with correct headings and paragraphs', () => {
		renderComponent();
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
		renderComponent();
		const contactusComponent = screen.getByText('Contact us');
		expect(contactusComponent).toBeInTheDocument();
	});

	it('does not render non-existent sections', () => {
		renderComponent();
		const nonExistentHeading = screen.queryByText('Non-existent Section');
		expect(nonExistentHeading).not.toBeInTheDocument();
	});

	it('renders the sections in the correct order', () => {
		renderComponent();
		const sectionHeadings = screen.getAllByRole('heading', {level: 2});
		expect(sectionHeadings[0]).toHaveTextContent('Journey');
		expect(sectionHeadings[1]).toHaveTextContent('Purpose and Goals');
		expect(sectionHeadings[2]).toHaveTextContent('Introduction to the Team');
		expect(sectionHeadings[3]).toHaveTextContent('Offerings');
	});

	it('renders paragraphs with appropriate content', () => {
		renderComponent();
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
