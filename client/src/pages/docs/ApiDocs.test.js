import {render, screen, waitFor} from '@testing-library/react';
import ApiDocs from './ApiDocs';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

vi.mock('react-markdown', () => ({children}) => <div>{children}</div>);
vi.mock('remark-gfm', () => () => <div />);

describe('ApiDocs Component', () => {
	beforeEach(() => {
		global.fetch = vi.fn();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('renders the markdown content', async () => {
		const mockMarkdown = `# My API Docs
								This is a sample markdown file for the API docs.
								## Endpoints
								### GET /api/endpoint
								This is a sample endpoint.
								#### Response
								\`\`\`
								{
								"data": "Sample response"
								}
								\`\`\`
							`;

		global.fetch.mockResolvedValueOnce({
			text: () => Promise.resolve(mockMarkdown),
		});

		render(<ApiDocs />);

		await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
		expect(screen.getByText(/My API Docs/i)).toBeTruthy();
	});

	it('should throw an error if API doc is not found', async () => {
		global.fetch.mockResolvedValueOnce({
			text: () => Promise.reject(''),
		});
		render(<ApiDocs />);

		await waitFor(() => {
			expect(screen.getByText('File Not Found!')).toHaveClass('errorMessage');
		});
	});
});
