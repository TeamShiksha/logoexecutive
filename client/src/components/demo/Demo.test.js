import {describe, it, expect} from 'vitest';
import {render, fireEvent, screen, waitFor} from '@testing-library/react';
import Demo from './Demo';

describe('Demo Component', () => {
	it('renders a text input field and a button', () => {
		render(<Demo />);
		expect(screen.getByText('Try it now')).toBeDefined();
		expect(screen.getByLabelText('Brand name')).toBeDefined();
		expect(screen.getByText('Go')).toBeDefined();
	});

	it('update Brand Name on input change', () => {
		render(<Demo />);
		const brandNameInput = screen.getByLabelText('Brand name');
		fireEvent.change(brandNameInput, {target: {value: 'google'}});
		expect(brandNameInput.value).toBe('google');
	});

	it('update Brand Name on reverted change', () => {
		render(<Demo />);
		const brandNameInput = screen.getByLabelText('Brand name');
		fireEvent.change(brandNameInput, {target: {value: 'google'}});
		fireEvent.change(brandNameInput, {target: {value: ''}});
		expect(brandNameInput.value).toBe('');
	});

	it('displays error for empty brandname', () => {
		render(<Demo />);
		const brandInput = screen.getByLabelText('Brand name');
		const goButton = screen.getByText('Go');
		fireEvent.change(brandInput, {target: {value: ''}});
		fireEvent.click(goButton);
		expect(screen.getByText('Brand Name is required')).toBeDefined();
	});

	it('displays error for invalid brandname', () => {
		render(<Demo />);
		const brandInput = screen.getByLabelText('Brand name');
		const goButton = screen.getByText('Go');
		fireEvent.change(brandInput, {target: {value: '@logo'}});
		fireEvent.change(brandInput, {target: {value: 'logo$'}});
		fireEvent.change(brandInput, {target: {value: '123#'}});
		fireEvent.click(goButton);
		expect(screen.getByText('Invalid Brand Name')).toBeDefined();
	});

	it('displays image for valid brandname', async () => {
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
