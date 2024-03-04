import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import Demo from './Demo';

describe('Demo Component', () => {
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
});
