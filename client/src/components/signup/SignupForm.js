import {useState} from 'react';
import Card from '../card/Card';
import {useApi} from '../../hooks/useApi';
import {NavLink} from 'react-router-dom';
import styles from './SignupForm.module.css';
import CustomInput from '../common/input/CustomInput';
import Button from '../common/Button/Button';

export function validateFormData(formData) {
	const errors = {};

	if (formData.firstName === '') {
		errors.firstName = 'First name is required.';
	} else if (/[^a-zA-Z]/.test(formData.firstName)) {
		errors.firstName = 'First name should only contain alphabets.';
	} else if (formData.firstName.length > 20) {
		errors.firstName = 'First name should not exceed 20 characters.';
	}

	if (formData.lastName === '') {
		errors.lastName = 'Last name is required.';
	} else if (/[^a-zA-Z]/.test(formData.lastName)) {
		errors.lastName = 'Last name should only contain alphabets.';
	} else if (formData.lastName.length > 20) {
		errors.lastName = 'Last name should not exceed 20 characters.';
	}

	if (formData.email === '') {
		errors.email = 'Email is required.';
	} else if (formData.email.length > 50) {
		errors.email = 'Email should not be more than 50 characters long.';
	} else if (!isValidEmail(formData.email)) {
		errors.email = 'Invalid email format.';
	}

	if (formData.password === '') {
		errors.password = 'Password is required.';
	} else if (formData.password.length < 8 || formData.password.length > 30) {
		errors.password = 'Password should be 8 to 30 characters long.';
	} else if (!isValidPassword(formData.password)) {
		errors.password =
			'Password should contain at least one uppercase letter, one lowercase letter, one digit, and one special character.';
	}

	if (formData.confirmPassword !== formData.password) {
		errors.confirmPassword = 'Passwords do not match.';
	}

	return errors;
}

export function isValidEmail(email) {
	const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
	return emailRegex.test(email);
}

export function isValidPassword(password) {
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
}

const INITIAL_DATA = {
	firstName: '',
	lastName: '',
	email: '',
	password: '',
	confirmPassword: '',
};

export default function SignupForm() {
	const [formData, setFormData] = useState(INITIAL_DATA);
	const [validationErrors, setValidationErrors] = useState({});
	const [isSignUpSuccess, setIsSignUpSuccess] = useState(false);
	const {data, errorMsg, makeRequest, loading} = useApi({
		url: `api/auth/signup`,
		method: 'post',
		data: formData,
	});

	const handleChange = (event) => {
		const {name, value} = event.target;

		const trimmedValue = value.trim();

		setFormData((prevData) => ({
			...prevData,
			[name]: trimmedValue,
		}));

		setValidationErrors((prevErrors) => ({
			...prevErrors,
			[name]: '',
		}));
	};

	const handleSubmit = async (event) => {
		event.preventDefault();

		const errors = validateFormData(formData);

		if (Object.keys(errors).length === 0) {
			const success = await makeRequest();
			if (success) {
				setFormData(INITIAL_DATA);
				setIsSignUpSuccess(true);
			}
		} else {
			setValidationErrors(errors);
		}
	};

	return (
		<div className={styles.Container}>
			<Card>
				<form onSubmit={handleSubmit} className={styles.FormBox}>
					<h2 className={styles.Title}>Sign up for free</h2>

					<p
						className={`input-error ${errorMsg ? '' : 'hidden'}`}
						aria-live='assertive'
						role='alert'
					>
						{errorMsg || ' '}
					</p>
					{isSignUpSuccess && <p className='signup-success'>{data.message}</p>}

					<CustomInput
						id='firstName'
						name='firstName'
						label='First Name'
						value={formData.firstName}
						onChange={handleChange}
						required
						error={validationErrors.firstName}
					/>

					<CustomInput
						id='lastName'
						name='lastName'
						value={formData.lastName}
						onChange={handleChange}
						required
						label='Last Name'
						error={validationErrors.lastName}
					/>

					<CustomInput
						type='email'
						id='email'
						name='email'
						value={formData.email}
						onChange={handleChange}
						required
						label='Email'
						error={validationErrors.email}
					/>

					<CustomInput
						type='password'
						id='password'
						name='password'
						value={formData.password}
						onChange={handleChange}
						required
						label='Password'
						error={validationErrors.password}
					/>

					<CustomInput
						type='password'
						id='confirmPassword'
						name='confirmPassword'
						value={formData.confirmPassword}
						onChange={handleChange}
						required
						label='Confirm Password'
						error={validationErrors.confirmPassword}
					/>

					<Button type='submit' disabled={loading}>
						<span style={{fontSize: '20px'}}>Register</span>
					</Button>

					<div className='input-actiontext'>
						<span>Already have an account?</span>
						<NavLink to='/signin' className='input-actiontext-link'>
							Sign in
						</NavLink>
					</div>
				</form>
			</Card>
		</div>
	);
}
