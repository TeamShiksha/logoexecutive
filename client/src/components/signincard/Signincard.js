import {useContext, useState} from 'react';
import {useLocation, useNavigate} from 'react-router';
import {NavLink} from 'react-router-dom';
import CustomInput from '../common/input/CustomInput';
import {AuthContext} from '../../contexts/AuthContext';
import {useApi} from '../../hooks/useApi';
import {INITIAL_SIGNIN_FORM_DATA} from '../../constants';
import {isValidEmail, isValidPassword} from '../../utils/helpers';
import './Signincard.css';

function Signincard() {
	const [formData, setFormData] = useState(INITIAL_SIGNIN_FORM_DATA);
	const [validationErrors, setValidationErrors] = useState('');
	const {setIsAuthenticated} = useContext(AuthContext);
	const navigate = useNavigate();
	const {state} = useLocation();
	const {errorMsg, makeRequest, loading} = useApi({
		url: `api/auth/signin`,
		method: 'post',
		data: formData,
	});

	const handleFormChange = (e) => {
		const {name, value} = e.target;
		const trimmedValue = value.trim();
		setValidationErrors(null);
		setFormData((prev) => {
			return {
				...prev,
				[name]: trimmedValue,
			};
		});
	};

	const validateFormData = () => {
		if (formData.email === '') {
			return 'Email is required';
		} else if (formData.email.length > 50) {
			return 'Email should not be more than 50 characters long';
		} else if (!isValidEmail(formData.email)) {
			return 'Invalid email format';
		}
		if (formData.password === '') {
			return 'Password is required';
		} else if (formData.password.length < 8 || formData.password.length > 30) {
			return 'Password should be 8 to 30 characters long';
		} else if (!isValidPassword(formData.password)) {
			return 'Password should contain at least one uppercase letter, one lowercase letter, one digit, and one special character';
		}
	};

	const handleSubmit = async (e) => {
		setValidationErrors(null);
		e.preventDefault();
		const error = validateFormData();
		if (error) {
			setValidationErrors(error);
		} else {
			const success = await makeRequest();
			if (success) {
				setFormData(INITIAL_SIGNIN_FORM_DATA);
				setIsAuthenticated(true);
				navigate(state?.path || '/dashboard');
			}
		}
	};

	return (
		<div className='inputlogin'>
			<h3 className='head3'>Sign in to dashboard</h3>
			<p
				className={`input-error ${validationErrors || errorMsg ? '' : 'hidden'}`}
				aria-live='assertive'
				role='alert'
			>
				{validationErrors || errorMsg || ' '}
			</p>
			<form onSubmit={handleSubmit} noValidate>
				<CustomInput
					type='text'
					className='inputs'
					name='email'
					label='email'
					value={formData.email}
					onChange={handleFormChange}
					disabled={loading}
				/>
				<CustomInput
					className='inputs'
					type='password'
					name='password'
					label='password'
					value={formData.password}
					onChange={handleFormChange}
					disabled={loading}
				/>
				<button
					className='login-btn'
					aria-label='Sign in to Dashboard'
					disabled={loading}
				>
					Sign In
				</button>
			</form>
			<section className='input-actiontext'>
				<div>
					<span className='input-actiontext-support'>No account?</span>
					<NavLink to='/signup' className='input-actiontext-link'>
						Sign up
					</NavLink>
				</div>
				<NavLink to='/forgot-password' className='input-actiontext-link'>
					Forgot Password
				</NavLink>
			</section>
		</div>
	);
}

export default Signincard;
