import {render, fireEvent, screen} from '@testing-library/react';
import ApiKeyTable from './ApiKeyTable';

describe('ApiKeyTable', () => {
	const keys = [
		{
			keyDescription: 'Test Key 1',
			key: '123',
			keyId: 'id1',
			createdAt: '2024-02-29',
		},
		{keyDescription: 'Test Key 2', key: '456', keyId: 'id2', createdAt: ''},
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
		expect(screen.getByText('February 29, 2024')).toBeInTheDocument();
		const elements = screen.getAllByText('');
		let found = false;
		elements.forEach((element) => {
			if (element.tagName == 'TD') {
				found = true;
			}
		});
		expect(found).toBe(true);
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
		expect(deleteKey).toHaveBeenCalledWith('id1');
	});
});
