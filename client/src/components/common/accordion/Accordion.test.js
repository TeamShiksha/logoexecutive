import {render, fireEvent, screen} from '@testing-library/react';
import Accordion from './Accordion';

describe('Accordion', () => {
	const mockToggle = jest.fn();

	beforeEach(() => {
		mockToggle.mockReset();
	});

	it('renders the title passed to it', () => {
		render(
			<Accordion title='Test Title' expanded={false} toggle={mockToggle}>
				Test Content
			</Accordion>,
		);
		expect(
			screen.getByRole('heading', {value: 'Test Title'}),
		).toBeInTheDocument();
	});

	it('calls toggle when title is clicked', () => {
		render(
			<Accordion title='Test Title' expanded={false} toggle={mockToggle}>
				Test Content
			</Accordion>,
		);
		fireEvent.click(screen.getByText('Test Title'));
		expect(mockToggle).toHaveBeenCalledWith('Test Title');
	});

	it('shows children when expanded is true', () => {
		render(
			<Accordion title='Test Title' expanded={true} toggle={mockToggle}>
				Test Content
			</Accordion>,
		);
		const contentWrapper = screen.getByTestId('accordion-content-wrapper');
		expect(contentWrapper).toHaveClass('show');
		expect(screen.getByText('Test Content')).toBeInTheDocument();
	});

	it('does not expand content when expanded is false', () => {
		render(
			<Accordion title='Test Title' expanded={false} toggle={mockToggle}>
				Test Content
			</Accordion>,
		);

		const contentWrapper = screen.getByTestId('accordion-content-wrapper');
		expect(contentWrapper).not.toHaveClass('show');
	});
});
