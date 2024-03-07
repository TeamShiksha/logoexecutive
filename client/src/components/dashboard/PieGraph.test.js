import {render, screen} from '@testing-library/react';
import PieGraph from './PieGraph';

describe('PieGraph', () => {
	it('displays the correct percentage', () => {
		render(<PieGraph percentage={50} colour='#000' fill='#fff' />);
		expect(screen.getByText('50%')).toBeInTheDocument();
	});

	it('does not display percentages over 100', () => {
		render(<PieGraph percentage={150} colour='#000' fill='#fff' />);
		expect(screen.getByText('100%')).toBeInTheDocument();
	});

	it('does not display negative percentages', () => {
		render(<PieGraph percentage={-50} colour='#000' fill='#fff' />);
		expect(screen.getByText('0%')).toBeInTheDocument();
	});
});
