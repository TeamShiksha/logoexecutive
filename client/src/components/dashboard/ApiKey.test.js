import {render, fireEvent, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ApiKey from './ApiKey';

describe('ApiKey', () => {
	it('renders correctly', () => {
		const handleCloseKey = jest.fn();
		const handleCopyToClipboard = jest.fn();
		const key = 'test_api_key';

		render(
			<ApiKey
				Key={key}
				handleCloseKey={handleCloseKey}
				handleCopyToClipboard={handleCopyToClipboard}
			/>,
		);

		expect(
			screen.getByText(
				'Make sure to copy your API KEY now. You won’t be able to see it again!',
			),
		).toBeInTheDocument();
		expect(screen.getByText('*******************')).toBeInTheDocument();
	});

	it('closes when the close button is clicked', () => {
		const handleCloseKey = jest.fn();
		const handleCopyToClipboard = jest.fn();
		const key = 'test_api_key';

		render(
			<ApiKey
				Key={key}
				handleCloseKey={handleCloseKey}
				handleCopyToClipboard={handleCopyToClipboard}
			/>,
		);

		const closeButton = screen.getByRole('button', {name: 'Close'});
		fireEvent.click(closeButton);
		expect(handleCloseKey).toHaveBeenCalledTimes(1);
	});

	it('copies the API key to clipboard when clicked', () => {
		const handleCloseKey = jest.fn();
		const handleCopyToClipboard = jest.fn();
		const key = 'test_api_key';

		render(
			<ApiKey
				Key={key}
				handleCloseKey={handleCloseKey}
				handleCopyToClipboard={handleCopyToClipboard}
			/>,
		);

		const copyButton = screen.getByLabelText('Copy API Key');
		userEvent.click(copyButton);
		expect(handleCopyToClipboard).toHaveBeenCalledWith(key);
	});
});
