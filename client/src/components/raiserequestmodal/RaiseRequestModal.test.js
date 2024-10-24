import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RaiseRequestModal from './RaiseRequestModal';
import {UserContext} from '../../contexts/UserContext';
import {useApi} from '../../hooks/useApi';

// Mock useApi hook
vi.mock('../../hooks/useApi', () => ({
	useApi: vi.fn(),
}));

describe('RaiseRequestModal Component', () => {
	const mockSetModal = vi.fn();
	const mockMakeRequest = vi.fn();
	const mockSetErrorMsg = vi.fn();
	const mockSetData = vi.fn();

	const renderWithContext = (props = {}) => {
		const defaultProps = {
			modalOpen: true,
			setModal: mockSetModal,
			userData: {userId: '123'},
		};

		const mergedProps = {...defaultProps, ...props};

		return render(
			<UserContext.Provider value={{userData: mergedProps.userData}}>
				<RaiseRequestModal
					modalOpen={mergedProps.modalOpen}
					setModal={mergedProps.setModal}
				/>
			</UserContext.Provider>,
		);
	};

	beforeEach(() => {
		vi.clearAllMocks();
		useApi.mockReturnValue({
			errorMsg: '',
			loading: false,
			data: '',
			setErrorMsg: mockSetErrorMsg,
			setData: mockSetData,
			makeRequest: mockMakeRequest,
		});
	});

	describe('Form Submission', () => {
		it('submits form and resets on success', async () => {
			mockMakeRequest.mockReturnValue(true);
			renderWithContext();
			const urlInput = screen.getByLabelText(/company url/i);

			await userEvent.type(urlInput, 'https://example.com');
			await userEvent.click(screen.getByRole('button', {name: /submit/i}));

			expect(mockMakeRequest).toHaveBeenCalled();
			expect(urlInput.value).toBe('');
		});

		it('keeps form data on failed submission', async () => {
			mockMakeRequest.mockReturnValue(false);
			renderWithContext();
			const urlInput = screen.getByLabelText(/company url/i);

			await userEvent.type(urlInput, 'https://example.com');
			const initialValue = urlInput.value;
			await userEvent.click(screen.getByRole('button', {name: /submit/i}));

			expect(mockMakeRequest).toHaveBeenCalled();
			expect(urlInput.value).toBe(initialValue);
		});
	});

	describe('API Integration', () => {
		it('shows API error message', async () => {
			useApi.mockReturnValue({
				errorMsg: 'API Error',
				loading: false,
				data: '',
				setErrorMsg: mockSetErrorMsg,
				setData: mockSetData,
				makeRequest: mockMakeRequest.mockReturnValue(false),
			});

			renderWithContext();
			const urlInput = screen.getByLabelText(/company url/i);

			await userEvent.type(urlInput, 'https://example.com');
			await userEvent.click(screen.getByRole('button', {name: /submit/i}));

			expect(screen.getByText('API Error')).toBeInTheDocument();
		});

		it('shows success message', async () => {
			useApi.mockReturnValue({
				errorMsg: '',
				loading: false,
				data: 'Request submitted successfully',
				setErrorMsg: mockSetErrorMsg,
				setData: mockSetData,
				makeRequest: mockMakeRequest.mockReturnValue(true),
			});

			renderWithContext();
			const urlInput = screen.getByLabelText(/company url/i);

			await userEvent.type(urlInput, 'https://example.com');
			await userEvent.click(screen.getByRole('button', {name: /submit/i}));

			expect(
				screen.getByText('Request submitted successfully'),
			).toBeInTheDocument();
		});

		it('disables submit button while loading', () => {
			useApi.mockReturnValue({
				errorMsg: '',
				loading: true,
				data: '',
				setErrorMsg: mockSetErrorMsg,
				setData: mockSetData,
				makeRequest: mockMakeRequest,
			});

			renderWithContext();
			const submitButton = screen.getByRole('button', {name: /submit/i});

			expect(submitButton).toBeDisabled();
		});
	});
});
