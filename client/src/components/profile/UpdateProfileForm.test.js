import React from 'react';
import {render, fireEvent, screen} from '@testing-library/react';
import UpdateProfileForm from './UpdateProfileForm';

describe('Profile component', () => {
	const updateProfileData = {};
	const setUpdateProfileData = jest.fn();

	const renderUpdateProfileForm = () => {
		return render(
			<UpdateProfileForm
				updateProfileData={updateProfileData}
				setUpdateProfileData={setUpdateProfileData}
			/>,
		);
	};

	it('updates first name on input change', () => {
		renderUpdateProfileForm();
		const firstNameInput = screen.getByLabelText('first name');
		fireEvent.change(firstNameInput, {target: {value: 'John'}});
		expect(firstNameInput.value).toBe('John');
	});

	it('updates last name on input change', () => {
		const updateProfileData = {firstName:'',lastName:''};
		const setUpdateProfileData = jest.fn();

		render(
			<UpdateProfileForm
			updateProfileData={updateProfileData}
			setUpdateProfileData={setUpdateProfileData}
		/>
		);
		const lastNameInput = screen.getByLabelText('last name');
		fireEvent.change(lastNameInput, {target: {value: 'Doe'}});
		expect(setUpdateProfileData).toHaveBeenCalledWith({
			...updateProfileData,
			lastName: 'Doe',
		});
		expect(lastNameInput.value).toBe('Doe');
	});

	// it('should throw an error if first name value format is invalid', () => {
	// 	renderUpdateProfileForm();

	// 	const firstName = screen.getByLabelText('first name');
	// 	const lastName = screen.getByLabelText('last name');
	// 	const saveButton = screen.getByRole('button', {
	// 		name: /Save/i,
	// 	});

	// 	fireEvent.change(firstName, {
	// 		target: {value: 'jhon@'},
	// 	});
	// 	fireEvent.change(lastName, {
	// 		target: {value: '12Doe'},
	// 	});
	// 	fireEvent.click(saveButton);

	// 	expect(
	// 		screen.getByText('First name should only contain alphabets'),
	// 	).toHaveClass('form-error');
	// });

	// it('should throw an error if last name value format is invalid', () => {
	// 	renderUpdateProfileForm();

	// 	const firstName = screen.getByLabelText('first name');
	// 	const lastName = screen.getByLabelText('last name');
	// 	const saveButton = screen.getByRole('button', {
	// 		name: /Save/i,
	// 	});

	// 	fireEvent.change(firstName, {
	// 		target: {value: 'dummy'},
	// 	});
	// 	fireEvent.change(lastName, {
	// 		target: {value: '12Doe'},
	// 	});
	// 	fireEvent.click(saveButton);

	// 	expect(
	// 		screen.getByText('Last name should only contain alphabets'),
	// 	).toHaveClass('form-error');
	// });
});
