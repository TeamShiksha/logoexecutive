import {render, screen, fireEvent} from '@testing-library/react';
import FAQs from './FAQs';
import {faqsData} from '../../constants';

describe('FAQ', () => {
	it('should render the FAQ questions and answers', () => {
		render(<FAQs />);
		expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument();
		fireEvent.click(screen.getByText(faqsData[0].title));
		expect(screen.getByText(faqsData[0].steps[0])).toBeInTheDocument();
		const stayTunedElements = screen.getAllByText('Stay tuned coming soon');
		fireEvent.click(screen.getByText(faqsData[1].title));
		stayTunedElements.forEach((element) => {
			expect(element).toBeInTheDocument();
		});
	});
});
