import {describe, it, expect} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import FAQs from './FAQs';

const faqsMockData = [
	{
		title: 'How to create API Keys ?',
		steps: [
			"Visit the dashboard page, go to the 'Your API Key' section, add a description, and click 'Generate Key.' Your newly generated key will be automatically included in the table displayed on the same page.",
		],
	},
	{
		title: 'How to upgrade plan ?',
		steps: ['Stay tuned coming soon'],
	},
	{
		title: 'How to see logs ?',
		steps: ['Stay tuned coming soon'],
	},
];

describe('FAQ', () => {
	it('should render the FAQ questions and answers', () => {
		render(<FAQs />);

		expect(screen.getByText('Frequently Asked Questions')).toBeDefined();

		fireEvent.click(screen.getByText(faqsMockData[0].title));
		expect(screen.getByText(faqsMockData[0].steps[0])).toBeDefined();

		fireEvent.click(screen.getByText(faqsMockData[1].title));
		const stayTunedElements = screen.getAllByText('Stay tuned coming soon');
		expect(stayTunedElements.length).toBe(2);
	});
});
