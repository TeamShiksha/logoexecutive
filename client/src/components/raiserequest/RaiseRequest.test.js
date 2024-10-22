import {render, screen, fireEvent} from '@testing-library/react';
import {expect, it, describe, vi} from 'vitest';
import RaiseRequest from './RaiseRequest';

vi.mock('../raiserequestmodal/RaiseRequestModal', () => ({
	default: ({modalOpen, setModal}) => {
		return modalOpen ? (
			<div data-testid='modal'>
				<button onClick={() => setModal(false)}>Close Modal</button>
			</div>
		) : null;
	},
}));

describe('RaiseRequest component', () => {
	it('renders RaiseRequest component', () => {
		render(<RaiseRequest />);

		expect(
			screen.getByText(/Couldn't find your logo try raising a request!/i),
		).toBeInTheDocument();
		expect(
			screen.getByRole('button', {name: /Raise a Request/i}),
		).toBeInTheDocument();
	});

	it('opens the modal when Raise a Request button is clicked', () => {
		render(<RaiseRequest />);

		const raiseRequestButton = screen.getByRole('button', {
			name: /Raise a Request/i,
		});
		fireEvent.click(raiseRequestButton);

		expect(screen.getByTestId('modal')).toBeInTheDocument();
	});

	it('closes the modal when close button is clicked', () => {
		render(<RaiseRequest />);

		const raiseRequestButton = screen.getByRole('button', {
			name: /Raise a Request/i,
		});
		fireEvent.click(raiseRequestButton);

		expect(screen.getByTestId('modal')).toBeInTheDocument();

		const closeButton = screen.getByRole('button', {name: /Close Modal/i});
		fireEvent.click(closeButton);

		expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
	});
});
