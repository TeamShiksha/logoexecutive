import {render, screen} from '@testing-library/react';
import Divider from './Divider';

describe('Divider', () => {
	it('renders divider component', () => {
		render(<Divider />);
		const divider = screen.getByTestId('divider');
		expect(divider).toBeInTheDocument();
	});
});
