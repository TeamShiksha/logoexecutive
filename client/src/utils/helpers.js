export const isValidEmail = (email) => {
	const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
	return emailRegex.test(email);
};

export const isValidPassword = (password) => {
	const hasUppercase = /[A-Z]/;
	const hasLowercase = /[a-z]/;
	const hasDigit = /\d/;
	const hasSpecialCharacter = /[!@#$%^&*]/;
	return (
		hasUppercase.test(password) &&
		hasLowercase.test(password) &&
		hasDigit.test(password) &&
		hasSpecialCharacter.test(password)
	);
};

export const isSQLInjectionAttempt = (message) => {
	const sqlInjectionRegex = /(')|(--)|(\/\*)|(\bSELECT\b)|\bunion\b/i;
	return sqlInjectionRegex.test(message);
};

export const isValidMessage = (message) => {
	const messageRegex = /^[^!@#$%^&*(){}[\]\\.;'",.<>/?`~|0-9]*$/;
	return messageRegex.test(message);
};

export const formatDate = (dateString) => {
	const date = dateString ? new Date(dateString) : new Date();
	return date.toLocaleDateString('en-us', {
		month: 'long',
		day: 'numeric',
		year: 'numeric',
	});
};
