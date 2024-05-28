import {
	isValidEmail,
	isValidPassword,
	isSQLInjectionAttempt,
	isValidMessage,
	formatDate,
} from './helpers';

describe('Helper functions', () => {
	test('isValidEmail', () => {
		expect(isValidEmail('test@example.com')).toBeTruthy();
		expect(isValidEmail('invalid_email')).toBeFalsy();
	});

	test('isValidPassword', () => {
		expect(isValidPassword('Password123!')).toBeTruthy();
		expect(isValidPassword('password')).toBeFalsy();
	});

	test('isSQLInjectionAttempt', () => {
		expect(isSQLInjectionAttempt('SELECT * FROM users')).toBeTruthy();
		expect(isSQLInjectionAttempt('safe message')).toBeFalsy();
	});

	test('isValidMessage', () => {
		expect(isValidMessage('Hello world')).toBeTruthy();
		expect(isValidMessage('Invalid message 123!')).toBeFalsy();
	});

	test('formatDate', () => {
		expect(formatDate('2024-05-23T07:23:21.816Z')).toBe('May 23, 2024');
		expect(formatDate()).toBe(
			new Date().toLocaleDateString('en-us', {
				month: 'long',
				day: 'numeric',
				year: 'numeric',
			}),
		);
	});
});
