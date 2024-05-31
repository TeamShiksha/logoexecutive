import React from 'react';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import Demo from './Demo';
import {useApi} from '../../hooks/useApi';

jest.mock('../../hooks/useApi');

describe('Demo Component', () => {
	beforeEach(() => {
		useApi.mockReturnValue({
			errorMsg: '',
			makeRequest: jest.fn(),
			data: null,
			loading: false,
		});
	});
	test('renders a text input field', () => {
		render(<Demo />);
		expect(screen.getByText('Try it now')).toBeInTheDocument();
		expect(screen.getByLabelText('Brand name')).toBeInTheDocument();
	});

	test('update Brand Name on input change', () => {
		render(<Demo />);
		const brandNameInput = screen.getByLabelText('Brand name');
		fireEvent.change(brandNameInput, {target: {value: 'google'}});
		expect(brandNameInput.value).toBe('google');
	});

	test('update Brand Name on reverted change', () => {
		render(<Demo />);
		const brandNameInput = screen.getByLabelText('Brand name');
		fireEvent.change(brandNameInput, {target: {value: 'google'}});
		fireEvent.change(brandNameInput, {target: {value: ''}});
		expect(brandNameInput.value).toBe('');
	});
	test('form submission triggers makeRequest', async () => {
		const makeRequestMock = jest.fn();
		useApi.mockReturnValue({
			errorMsg: '',
			makeRequest: makeRequestMock,
			data: null,
			loading: false,
		});
		render(<Demo />);
		const brandNameInput = screen.getByLabelText('Brand name');
		fireEvent.change(brandNameInput, {target: {value: 'google'}});
		const form = screen.getByTestId('demo-form');
		fireEvent.submit(form);

		await waitFor(() => {
			expect(makeRequestMock).toHaveBeenCalled();
		});
	});
	test('displays spinner while data is being fetched', async () => {
		useApi.mockReturnValue({
			errorMsg: '',
			makeRequest: jest.fn(
				() => new Promise((resolve) => setTimeout(resolve, 1000)),
			),
			data: null,
			loading: true,
		});
		render(<Demo />);
	});
	test('displays error message when errorMsg is present', () => {
		useApi.mockReturnValue({
			errorMsg: 'Error fetching data',
			makeRequest: jest.fn(),
			data: null,
			loading: false,
		});
		render(<Demo />);
		expect(screen.getByText('Error fetching data')).toBeInTheDocument();
	});
	test('displays logo image when data is fetched', () => {
		useApi.mockReturnValue({
			errorMsg: '',
			makeRequest: jest.fn(),
			data: {data: 'logo-url'},
			loading: false,
		});
		render(<Demo />);
		const brandNameInput = screen.getByLabelText('Brand name');
		fireEvent.change(brandNameInput, {target: {value: 'google'}});
		expect(screen.getByAltText('Logo').src).toContain('logo-url');
	});
});
