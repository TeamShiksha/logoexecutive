import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import Spinner from './Spinner';

describe('Spinner Component', () => {
	it('renders spinner container and spinner element', () => {
		render(<Spinner />);

		const containerElement = screen.getByTestId('spinner-container');
		expect(containerElement).toBeDefined();
		const spinnerElement = screen.getByTestId('spinner');
		expect(spinnerElement).toBeDefined();
	});
});
