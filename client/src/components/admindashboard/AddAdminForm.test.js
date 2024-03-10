import {render, screen, fireEvent} from '@testing-library/react';
import AddAdminForm from './AddAdminForm';

describe('AddAdminForm', () => {
	it('renders the form with email and reason inputs', () => {
		const setAdminDetailsMock = jest.fn();
		render(<AddAdminForm setAdminDetails={setAdminDetailsMock} />);

		expect(screen.getByLabelText('Admin Email')).toBeInTheDocument();
		expect(screen.getByLabelText('reason')).toBeInTheDocument();
		expect(screen.getByText('Add Admin')).toBeInTheDocument();
	});

	it('updates state on email and reason input changes', () => {
		const setAdminDetailsMock = jest.fn();
		render(<AddAdminForm setAdminDetails={setAdminDetailsMock} />);

		const emailInput = screen.getByLabelText('Admin Email');
		const reasonInput = screen.getByLabelText('reason');

		fireEvent.change(emailInput, {target: {value: 'admin@example.com'}});
		fireEvent.change(reasonInput, {target: {value: 'New admin'}});

		expect(emailInput.value).toBe('admin@example.com');
		expect(reasonInput.value).toBe('New admin');
	});

	it('calls setAdminDetails with the correct data on form submission', () => {
		const setAdminDetailsMock = jest.fn();
		render(<AddAdminForm setAdminDetails={setAdminDetailsMock} />);

		const emailInput = screen.getByLabelText('Admin Email');
		const reasonInput = screen.getByLabelText('reason');
		const addButton = screen.getByText('Add Admin');

		fireEvent.change(emailInput, {target: {value: 'admin@example.com'}});
		fireEvent.change(reasonInput, {target: {value: 'New admin'}});

		fireEvent.click(addButton);

		expect(setAdminDetailsMock).toHaveBeenCalledTimes(1);
	});

	it('resets email and reason state after form submission', () => {
		const setAdminDetailsMock = jest.fn();
		render(<AddAdminForm setAdminDetails={setAdminDetailsMock} />);

		const emailInput = screen.getByLabelText('Admin Email');
		const reasonInput = screen.getByLabelText('reason');
		const addButton = screen.getByText('Add Admin');

		fireEvent.change(emailInput, {target: {value: 'admin@example.com'}});
		fireEvent.change(reasonInput, {target: {value: 'New admin'}});

		fireEvent.click(addButton);

		expect(emailInput.value).toBe('');
		expect(reasonInput.value).toBe('');
	});
});
