import {render, fireEvent, screen} from '@testing-library/react';
import ApiKeyTable from './ApiKeyTable';

describe('ApiKeyTable', () => {
	const keys = [
		{description: 'Test Key 1', apiKey: '123', createDate: '2024-02-29'},
		{description: 'Test Key 2', apiKey: '456', createDate: '2024-02-28'},
	];

	it('renders correctly', () => {
		render(
			<ApiKeyTable
				keys={keys}
				copiedKey=''
				handleCopyToClipboard={() => {}}
				deleteKey={() => {}}
			/>,
		);

		expect(screen.getByText('Test Key 1')).toBeInTheDocument();
		expect(screen.getByText('Test Key 2')).toBeInTheDocument();
	});

	it('handles copy to clipboard', () => {
		const handleCopyToClipboard = jest.fn();
		render(
			<ApiKeyTable
				keys={keys}
				copiedKey=''
				handleCopyToClipboard={handleCopyToClipboard}
				deleteKey={() => {}}
			/>,
		);

		const buttons = screen.getAllByTestId('api-key-copy');
		fireEvent.click(buttons[0]);
		expect(handleCopyToClipboard).toHaveBeenCalledWith('123');
	});

	it('shows copied icon when key is copied', () => {
		const handleCopyToClipboard = jest.fn();
		render(
			<ApiKeyTable
				keys={keys}
				copiedKey='123'
				handleCopyToClipboard={handleCopyToClipboard}
				deleteKey={() => {}}
			/>,
		);

		const buttons = screen.getAllByTestId('api-key-copy');
		fireEvent.click(buttons[0]);
		expect(screen.getByTestId('api-key-copied')).toBeInTheDocument();
	});

	it('removes key when delete is clicked', () => {
		const deleteKey = jest.fn();
		render(
			<ApiKeyTable
				keys={keys}
				copiedKey=''
				handleCopyToClipboard={() => {}}
				deleteKey={deleteKey}
			/>,
		);

		const buttons = screen.getAllByTestId('api-key-delete');
		fireEvent.click(buttons[0]);
		expect(deleteKey).toHaveBeenCalledWith('123');
	});
});
