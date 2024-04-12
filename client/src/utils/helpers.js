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

export const isLettersAndSpacesOnly = (description) => {
	const regex = /^[a-zA-Z\s]*$/;
	return regex.test(description);
};
