import {
	isValidEmail,
	isValidPassword,
	isSQLInjectionAttempt,
	isValidMessage,
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
});
