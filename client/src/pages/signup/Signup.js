import {useState} from 'react';
import {NavLink} from 'react-router-dom';
import './Signup.css';
import {useApi} from '../../hooks/useApi';
import {INITIAL_SIGNUP_FORM_DATA} from '../../constants';

export const Signup = () => {
	const [formData, setFormData] = useState(INITIAL_SIGNUP_FORM_DATA);
	const [validationErrors, setValidationErrors] = useState({});
	const [isSignUpSuccess, setIsSignUpSuccess] = useState(false);
	const {data, errorMsg, makeRequest} = useApi({
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

	const validateFormData = () => {
		const errors = {};

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

		if (formData.lastName === '') {
			errors.lastName = 'Last name is required.';
		} else if (/[^a-zA-Z]/.test(formData.lastName)) {
			errors.lastName = 'Last name should only contain alphabets.';
		} else if (formData.lastName.length < 1 || formData.lastName.length > 20) {
			errors.lastName = 'Last name should be 1 to 20 characters long.';
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
	};

	const handleSubmit = async (event) => {
		setValidationErrors({});
		setIsSignUpSuccess(false);
		event.preventDefault();

		const errors = validateFormData();

		if (Object.keys(errors).length === 0) {
			const success = await makeRequest();
			if (success) {
				setFormData(INITIAL_SIGNUP_FORM_DATA);
				setIsSignUpSuccess(true);
			}
		} else {
			setValidationErrors(errors);
		}
	};

	const isValidEmail = (email) => {
		const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
		return emailRegex.test(email);
	};

	const isValidPassword = (password) => {
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
					<button type='submit' className='submit-button'>
						Register
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
