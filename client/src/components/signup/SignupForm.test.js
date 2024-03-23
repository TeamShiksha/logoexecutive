import {isValidEmail, isValidPassword, validateFormData} from './SignupForm';

describe('valdiateFormData', () => {
	const validFormData = {
		firstName: 'John',
		lastName: 'Doe',
		email: 'john.doe@example.com',
		password: 'Johndoe@password1',
		confirmPassword: 'Johndoe@password1',
	};

	it('Success - no error', () => {
		const result = validateFormData(validFormData);

		expect(result).toEqual({});
	});

	it('firstName - should only contain alphabets', () => {
		const input = {...validFormData, firstName: 'J@me'};

		expect(validateFormData(input)).toEqual({
			firstName: 'First name should only contain alphabets.',
		});
	});

	it('firstName - is required', () => {
		const input = {...validFormData, firstName: ''};

		expect(validateFormData(input)).toEqual({
			firstName: 'First name is required.',
		});
	});

	it('firstName - should not exceed 20 characters', () => {
		const input = {...validFormData, firstName: 'reallylonginvalidfirstName'};

		expect(validateFormData(input)).toEqual({
			firstName: 'First name should not exceed 20 characters.',
		});
	});

	it('lastName - is required', () => {
		const input = {...validFormData, lastName: ''};

		expect(validateFormData(input)).toEqual({
			lastName: 'Last name is required.',
		});
	});

	it('lastName - should only contain alphabets', () => {
		const input = {...validFormData, lastName: 'J@me'};

		const result = validateFormData(input);

		expect(result).toEqual({
			lastName: 'Last name should only contain alphabets.',
		});
	});

	it('lastName - should not exceed 20 characters', () => {
		const input = {...validFormData, lastName: 'reallylonginvalidlastName'};

		expect(validateFormData(input)).toEqual({
			lastName: 'Last name should not exceed 20 characters.',
		});
	});

	it('email - is required', () => {
		const input = {...validFormData, email: ''};

		expect(validateFormData(input)).toEqual({email: 'Email is required.'});
	});

	it('email - should not exceed 50 characters', () => {
		const input = {
			...validFormData,
			email:
				'reallylongemailthatismorethan50characterslongandshouldnotbevalidated@gmail.com',
		};

		expect(validateFormData(input)).toEqual({
			email: 'Email should not be more than 50 characters long.',
		});
	});

	it('email - should be valid', () => {
		const input = {...validFormData, email: 'john@'};

		expect(validateFormData(input)).toEqual({email: 'Invalid email format.'});
	});

	it('password - is required', () => {
		const input = {...validFormData, password: '', confirmPassword: ''};

		expect(validateFormData(input)).toEqual({
			password: 'Password is required.',
		});
	});

	it('password - at least 8 characters long', () => {
		const input = {...validFormData, password: 'abc', confirmPassword: 'abc'};

		expect(validateFormData(input)).toEqual({
			password: 'Password should be 8 to 30 characters long.',
		});
	});

	it('password - less than 30 characters', () => {
		const input = {
			...validFormData,
			password: 'reallylongpasswordthatshouldnotbevalidated',
			confirmPassword: 'reallylongpasswordthatshouldnotbevalidated',
		};

		expect(validateFormData(input)).toEqual({
			password: 'Password should be 8 to 30 characters long.',
		});
	});

	it('password - should be valid (contains no uppercase, no digit and no special characters)', () => {
		const input = {
			...validFormData,
			password: 'shouldbevalid',
			confirmPassword: 'shouldbevalid',
		};

		expect(validateFormData(input)).toEqual({
			password:
				'Password should contain at least one uppercase letter, one lowercase letter, one digit, and one special character.',
		});
	});

	it('password - should be valid (no digit and no special characters)', () => {
		const input = {
			...validFormData,
			password: 'Shouldbevalid',
			confirmPassword: 'Shouldbevalid',
		};

		expect(validateFormData(input)).toEqual({
			password:
				'Password should contain at least one uppercase letter, one lowercase letter, one digit, and one special character.',
		});
	});

	it('password - should be valid (no special characters)', () => {
		const input = {
			...validFormData,
			password: 'Shouldbevalid1',
			confirmPassword: 'Shouldbevalid1',
		};

		expect(validateFormData(input)).toEqual({
			password:
				'Password should contain at least one uppercase letter, one lowercase letter, one digit, and one special character.',
		});
	});

	it('confirmPassword - should match password', () => {
		const input = {...validFormData, confirmPassword: 'differentPassword'};

		expect(validateFormData(input)).toEqual({
			confirmPassword: 'Passwords do not match.',
		});
	});
});

describe('isValidEmail', () => {
	it('false - invalid email', () => {
		const input = 'joe@';

		expect(isValidEmail(input)).toBe(false);
	});

	it('true - valid email', () => {
		const input = 'john@example.com';

		expect(isValidEmail(input)).toBe(true);
	});
});

describe('isValidPassword', () => {
	it('false - invalid password (does not contain lowercase)', () => {
		const input = 'ONLYUPPERCASE';

		expect(isValidPassword(input)).toBe(false);
	});

	it('false - invalid password (does not contain uppercase)', () => {
		const input = 'onlylowercase';

		expect(isValidPassword(input)).toBe(false);
	});

	it('false - invalid password (does not contain digit)', () => {
		const input = 'OnlyLowercase';

		expect(isValidPassword(input)).toBe(false);
	});

	it('false - invalid password (does not contain special character)', () => {
		const input = 'OnlyLowercase12';

		expect(isValidPassword(input)).toBe(false);
	});

	it('true - valid password', () => {
		const input = 'Johndoe@124';

		expect(isValidPassword(input)).toBe(true);
	});
});
