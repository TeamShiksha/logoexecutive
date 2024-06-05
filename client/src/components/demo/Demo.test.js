import React from 'react';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import Demo from './Demo';
describe('Demo Component', () => {
	test('renders a text input field and a button', () => {
		render(<Demo />);
		expect(screen.getByText('Try it now')).toBeInTheDocument();
		expect(screen.getByLabelText('Brand name')).toBeInTheDocument();
		expect(screen.getByText('Go')).toBeInTheDocument();
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
	test('displays error for empty brandname', () => {
		render(<Demo />);
		const brandInput = screen.getByLabelText('Brand name');
		const goButton = screen.getByText('Go');
		fireEvent.change(brandInput, {target: {value: ''}});
		fireEvent.click(goButton);
		expect(screen.getByText('Brand Name is required')).toBeInTheDocument();
	});
	test('displays error for invalid brandname', () => {
		render(<Demo />);
		const brandInput = screen.getByLabelText('Brand name');
		const goButton = screen.getByText('Go');
		fireEvent.change(brandInput, {target: {value: '@logo'}});
		fireEvent.change(brandInput, {target: {value: 'logo$'}});
		fireEvent.change(brandInput, {target: {value: '123#'}});
		fireEvent.click(goButton);
		expect(screen.getByText('Invalid Brand Name')).toBeInTheDocument();
	});
	test('displays image for valid brandname', async () => {
		render(<Demo />);
		const brandInput = screen.getByLabelText('Brand name');
		const goButton = screen.getByText('Go');
		fireEvent.change(brandInput, {target: {value: 'Google'}});
		fireEvent.click(goButton);
		await waitFor(() => {
			const logo = screen.getByAltText('Logo');
			expect(logo).toHaveAttribute('src', 'http://localhost/google.png');
		});
	});
});
