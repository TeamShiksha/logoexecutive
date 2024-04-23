import {useState, useContext} from 'react';
import {NavLink, Navigate} from 'react-router-dom';
import {useApi} from '../../hooks/useApi';
import {INITIAL_SIGNUP_FORM_DATA} from '../../constants';
import {AuthContext} from '../../contexts/AuthContext';
import {isValidEmail, isValidPassword} from '../../utils/helpers';
import './Signup.css';

function Signup() {
	const {isAuthenticated} = useContext(AuthContext);
	const [formData, setFormData] = useState(INITIAL_SIGNUP_FORM_DATA);
	const [validationErrors, setValidationErrors] = useState({});
	const [isSignUpSuccess, setIsSignUpSuccess] = useState(false);
	const {data, errorMsg, makeRequest, loading} = useApi({
		url: `api/auth/signup`,
		method: 'post',
		data: formData,
	});

	const handleChange = (event) => {
		const {name, value} = event.target;
		const trimmedValue = name === 'firstName' ? value : value.trim();
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
			errors.firstName = 'First name is required';
		} else if (/[^a-zA-Z\s]/.test(formData.firstName)) {
			errors.firstName = 'First name should only contain alphabets';
		} else if (
			formData.firstName.length < 1 ||
			formData.firstName.length > 20
		) {
			errors.firstName = 'First name should be 1 to 20 characters long';
		}
		if (formData.lastName === '') {
			errors.lastName = 'Last name is required';
		} else if (/[^a-zA-Z]/.test(formData.lastName)) {
			errors.lastName = 'Last name should only contain alphabets';
		} else if (formData.lastName.length < 1 || formData.lastName.length > 20) {
			errors.lastName = 'Last name should be 1 to 20 characters long';
		}
		if (formData.email === '') {
			errors.email = 'Email is required';
		} else if (formData.email.length > 50) {
			errors.email = 'Email should not be more than 50 characters long';
		} else if (!isValidEmail(formData.email)) {
			errors.email = 'Invalid email format';
		}
		if (formData.password === '') {
			errors.password = 'Password is required';
		} else if (formData.password.length < 8 || formData.password.length > 30) {
			errors.password = 'Password should be 8 to 30 characters long';
		} else if (!isValidPassword(formData.password)) {
			errors.password =
				'Password should contain at least one uppercase letter, one lowercase letter, one digit, and one special character';
		}
		if (formData.confirmPassword === '') {
			errors.confirmPassword = 'Confirm password is required';
		} else if (formData.confirmPassword !== formData.password) {
			errors.confirmPassword = 'Passwords do not match';
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

	if (isAuthenticated) {
		return <Navigate to='/dashboard' />;
	}

	return (
		<>
			<div className='page-div'>
				<form onSubmit={handleSubmit} noValidate className='form-box'>
					<h2 className='form-title'>Sign up for free</h2>
					<p
						className={`input-error ${Object.values(validationErrors).length > 0 || errorMsg ? '' : 'hidden'}`}
						aria-live='assertive'
						role='alert'
					>
						{Object.values(validationErrors)[0] || errorMsg || ' '}
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
							disabled={loading}
						/>
						<label className='user-label' htmlFor='firstName'>
							First Name
						</label>
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
							disabled={loading}
						/>
						<label className='user-label' htmlFor='lastName'>
							Last Name
						</label>
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
							disabled={loading}
						/>
						<label className='user-label' htmlFor='email'>
							Email
						</label>
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
							disabled={loading}
						/>
						<label className='user-label' htmlFor='password'>
							Password
						</label>
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
							disabled={loading}
						/>
						<label className='user-label' htmlFor='confirmPassword'>
							Confirm Password
						</label>
					</div>
					<div className='input-group'>
						<button type='submit' className='submit-button' disabled={loading}>
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
		</>
	);
}

export default Signup;
