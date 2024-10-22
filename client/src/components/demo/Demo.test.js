import {describe, it, expect, vi} from 'vitest'; // Ensure vi is imported
import {render, fireEvent, screen, waitFor} from '@testing-library/react';
import {AuthContext} from '../../contexts/AuthContext';
import {UserContext} from '../../contexts/UserContext';
import {useApi} from '../../hooks/useApi';
import Demo from './Demo';

vi.mock('../../hooks/useApi', () => ({
	useApi: vi.fn(() => ({
		errorMsg: '',
		loading: false,
		data: null,
		isSuccess: false,
		setErrorMsg: vi.fn(),
		makeRequest: vi.fn(),
	})),
}));

const renderWithContext = (
	isAuthenticated = false,
	userData = {userId: 1, name: 'Test User'},
) => {
	return render(
		<AuthContext.Provider value={{isAuthenticated}}>
			<UserContext.Provider value={{userData}}>
				<Demo />
			</UserContext.Provider>
		</AuthContext.Provider>,
	);
};

describe('Demo Component', () => {
	it('renders a text input field and a button', () => {
		renderWithContext();
		expect(screen.getByText('Try it now')).toBeDefined();
		expect(screen.getByLabelText('Brand name')).toBeDefined();
		expect(screen.getByText('Go')).toBeDefined();
	});

	it('updates Brand Name on input change', () => {
		renderWithContext();
		const brandNameInput = screen.getByLabelText('Brand name');
		fireEvent.change(brandNameInput, {target: {value: 'google'}});
		expect(brandNameInput.value).toBe('google');
	});

	it('reverts Brand Name on change', () => {
		renderWithContext();
		const brandNameInput = screen.getByLabelText('Brand name');
		fireEvent.change(brandNameInput, {target: {value: 'google'}});
		fireEvent.change(brandNameInput, {target: {value: ''}});
		expect(brandNameInput.value).toBe('');
	});

	it('displays error for empty brand name', () => {
		renderWithContext();
		const brandInput = screen.getByLabelText('Brand name');
		const goButton = screen.getByText('Go');
		fireEvent.change(brandInput, {target: {value: ''}});
		fireEvent.click(goButton);
		expect(screen.getByText('Brand Name is required')).toBeDefined();
	});

	it('displays error for invalid brand name', () => {
		renderWithContext();
		const brandInput = screen.getByLabelText('Brand name');
		const goButton = screen.getByText('Go');
		fireEvent.change(brandInput, {target: {value: '@logo'}});
		fireEvent.click(goButton);
		expect(screen.getByText('Invalid Brand Name')).toBeDefined();
	});

	it('displays image when data is successfully loaded', async () => {
		const mockSetErrorMsg = vi.fn();
		let mockData = null;

		const mockUseApi = {
			errorMsg: '',
			loading: false,
			data: mockData,
			isSuccess: false,
			setErrorMsg: mockSetErrorMsg,
			makeRequest: () => {
				mockData = {data: 'https://example.com/logo.png'};
				mockUseApi.data = mockData;
				mockUseApi.isSuccess = true;
			},
		};

		useApi.mockReturnValue(mockUseApi);

		renderWithContext(true);

		const brandInput = screen.getByLabelText('Brand name');
		const goButton = screen.getByText('Go');

		fireEvent.change(brandInput, {target: {value: 'Google'}});
		fireEvent.click(goButton);

		await waitFor(() => {
			expect(screen.getByRole('img', {name: 'Logo'})).toBeInTheDocument();
		});
	});

	it('does not render RaiseRequest if errorMsg is absent', () => {
		useApi.mockReturnValueOnce({
			errorMsg: '',
			loading: false,
			data: null,
			setErrorMsg: vi.fn(),
			makeRequest: vi.fn(),
		});
		renderWithContext(true);
		const requestButton = screen.queryByRole('button', {
			name: /raise a request/i,
		});
		expect(requestButton).not.toBeInTheDocument();
	});

	it('does not render RaiseRequest if user is not authenticated', () => {
		useApi.mockReturnValueOnce({
			errorMsg: 'some error',
			loading: false,
			data: null,
			setErrorMsg: vi.fn(),
			makeRequest: vi.fn(),
		});
		renderWithContext(false);
		const requestButton = screen.queryByRole('button', {
			name: /raise a request/i,
		});
		expect(requestButton).not.toBeInTheDocument();
	});

	it('renders RaiseRequest if errorMsg exists and user is authenticated', async () => {
		useApi.mockReturnValueOnce({
			errorMsg: 'some error',
			loading: false,
			data: null,
			setErrorMsg: vi.fn(),
			makeRequest: vi.fn(),
		});
		renderWithContext(true, {userId: 1, name: 'Test User'});

		await waitFor(() => {
			const requestButton = screen.getByRole('button', {
				name: /Raise a Request/i,
			});
			expect(requestButton).toBeInTheDocument();
		});
	});
});
