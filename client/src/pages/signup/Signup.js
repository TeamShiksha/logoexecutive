import {useState} from 'react';
import {NavLink} from 'react-router-dom';
import './Signup.css';
import {useApi} from '../../hooks/useApi';

export const Signup = () => {
	const INITIAL_FORM_DATA = {
		firstName: '',
		lastName: '',
		email: '',
		password: '',
		confirmPassword: '',
	};
	const [formData, setFormData] = useState(INITIAL_FORM_DATA);
	const [validationErrors, setValidationErrors] = useState({});
	const [isSignUpSuccess, setIsSignUpSuccess] = useState(false);
	const {data, errorMsg, loading, makeRequest} = useApi({
		url: `auth/signup`,
		method: 'post',
		data: formData,
	});

	const handleChange = (event) => {
		const {name, value} = event.target;

		// Trim leading and trailing whitespace from the input value
		const trimmedValue = value.trim();

		setFormData((prevData) => ({
			...prevData,
			[name]: trimmedValue,
		}));

		// Reset the validation error for the current field
		setValidationErrors((prevErrors) => ({
			...prevErrors,
			[name]: '',
		}));
	};

	const validateFormData = () => {
		const errors = {};

		// Validation for First Name
		if (formData.firstName === '') {
			errors.firstName = 'First name is required.';
		} else if (/[^a-zA-Z]/.test(formData.firstName)) {
			errors.firstName = 'First name should only contain alphabets.';
		} else if (
			formData.firstName.length < 1 ||
			formData.firstName.length > 20
		) {
			errors.firstName = 'First name should be 1 to 20 characters long.';
		}

		// Validation for Last Name
		if (formData.lastName === '') {
			errors.lastName = 'Last name is required.';
		} else if (/[^a-zA-Z]/.test(formData.lastName)) {
			errors.lastName = 'Last name should only contain alphabets.';
		} else if (formData.lastName.length < 1 || formData.lastName.length > 20) {
			errors.lastName = 'Last name should be 1 to 20 characters long.';
		}

		// Validation for Email
		if (formData.email === '') {
			errors.email = 'Email is required.';
		} else if (formData.email.length > 50) {
			errors.email = 'Email should not be more than 50 characters long.';
		} else if (!isValidEmail(formData.email)) {
			errors.email = 'Invalid email format.';
		}

		// Validation for Password
		if (formData.password === '') {
			errors.password = 'Password is required.';
		} else if (formData.password.length < 8 || formData.password.length > 30) {
			errors.password = 'Password should be 8 to 30 characters long.';
		} else if (!isValidPassword(formData.password)) {
			errors.password =
				'Password should contain at least one uppercase letter, one lowercase letter, one digit, and one special character.';
		}

		// Validation for Confirm Password
		if (formData.confirmPassword !== formData.password) {
			errors.confirmPassword = 'Passwords do not match.';
		}

		return errors;
	};

	const handleSubmit = async (event) => {
		setValidationErrors({});
		setIsSignUpSuccess(false);
		event.preventDefault();

		// Validate the form data
		const errors = validateFormData();

		// Check if there are any validation errors
		if (Object.keys(errors).length === 0) {
			// No errors, proceed with registration logic here
			const success = await makeRequest();
			if (success) {
				setFormData(INITIAL_FORM_DATA);
				setIsSignUpSuccess(true);
			}
		} else {
			// Set the validation errors
			setValidationErrors(errors);
		}
	};

	const isValidEmail = (email) => {
		const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
		return emailRegex.test(email);
	};

	const isValidPassword = (password) => {
		// Define your password strength criteria here
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

	return (
		<div className='page-div'>
			<form onSubmit={handleSubmit} noValidate className='form-box'>
				<h2 className='form-title'>Sign up for free</h2>
				<p
					className={`input-error ${errorMsg ? '' : 'hidden'}`}
					aria-live='assertive'
					role='alert'
				>
					{errorMsg || ' '}
				</p>
				{isSignUpSuccess && <p className='signup-success'>{data.message}</p>}
				<div className='input-group'>
					<input
						type='text'
						id='firstName'
						name='firstName'
						value={formData.firstName}
						onChange={handleChange}
						required
						className='input'
					/>
					<label className='user-label' htmlFor='firstName'>
						First Name
					</label>
					<p className='error'>{validationErrors.firstName}</p>
				</div>

				<div className='input-group'>
					<input
						type='text'
						id='lastName'
						name='lastName'
						value={formData.lastName}
						onChange={handleChange}
						required
						className='input'
					/>
					<label className='user-label' htmlFor='lastName'>
						Last Name
					</label>
					<p className='error'>{validationErrors.lastName}</p>
				</div>

				<div className='input-group'>
					<input
						type='text'
						id='email'
						name='email'
						value={formData.email}
						onChange={handleChange}
						required
						className='input'
					/>
					<label className='user-label' htmlFor='email'>
						Email
					</label>
					<p className='error'>{validationErrors.email}</p>
				</div>

				<div className='input-group'>
					<input
						type='password'
						id='password'
						name='password'
						value={formData.password}
						onChange={handleChange}
						required
						className='input'
					/>
					<label className='user-label' htmlFor='password'>
						Password
					</label>
					<p className='error'>{validationErrors.password}</p>
				</div>

				<div className='input-group'>
					<input
						type='password'
						id='confirmPassword'
						name='confirmPassword'
						value={formData.confirmPassword}
						onChange={handleChange}
						required
						className='input'
					/>
					<label className='user-label' htmlFor='confirmPassword'>
						Confirm Password
					</label>
					<p className='error'>{validationErrors.confirmPassword}</p>
				</div>
				<div className='input-group'>
					<button type='submit' className='submit-button' disabled={loading}>
						{loading ? 'Submitting...' : 'Register'}
					</button>
				</div>
				<div className='input-actiontext'>
					<span>Already have an account?</span>
					<NavLink to='/signin' className='input-actiontext-link'>
						Sign in
					</NavLink>
				</div>
			</form>
		</div>
	);
};
