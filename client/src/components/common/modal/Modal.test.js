import {render, fireEvent, screen} from '@testing-library/react';
import Modal from './Modal';

describe('Modal', () => {
	const mockSetModal = jest.fn();

	beforeEach(() => {
		mockSetModal.mockReset();
	});

	it('renders Modal with children passed to it', () => {
		render(<Modal modalOpen={true}>Test Content</Modal>);
		expect(screen.getByText('Test Content')).toBeInTheDocument();
	});

	it('closes modal when close button is clicked', () => {
		render(
			<Modal modalOpen={true} setModal={mockSetModal}>
				Test Content
			</Modal>,
		);
		fireEvent.click(screen.getByTestId('modal-close'));
		expect(mockSetModal).toHaveBeenCalledWith(false);
	});

	it('closes modal when cancel button is clicked', () => {
		render(
			<Modal modalOpen={true} setModal={mockSetModal} showButtons={true}>
				Test Content
			</Modal>,
		);
		const cancelButton = screen.getByRole('button', {name: 'Cancel'});
		fireEvent.click(cancelButton);
		expect(mockSetModal).toHaveBeenCalledWith(false);
	});

	it('closes modal when clicked outside', () => {
		render(
			<Modal modalOpen={true} setModal={mockSetModal}>
				Test Content
			</Modal>,
		);
		fireEvent.click(screen.getByTestId('modal-bg'));
		expect(mockSetModal).toHaveBeenCalledWith(false);
	});

	it('should show buttons if showButtons is true', () => {
		render(<Modal modalOpen={true} showButtons={true} />);
		const okayButton = screen.getByRole('button', {name: 'Okay'});
		const cancelButton = screen.getByRole('button', {name: 'Cancel'});
		expect(okayButton).toBeInTheDocument();
		expect(cancelButton).toBeInTheDocument();
	});

	it('should not show buttons if showButtons is false', () => {
		render(<Modal modalOpen={true} showButtons={false} />);
		expect(screen.queryByText('Cancel')).toBeNull();
		expect(screen.queryByText('Okay')).toBeNull();
	});
});
