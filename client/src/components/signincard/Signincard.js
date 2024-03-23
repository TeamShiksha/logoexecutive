import {useContext, useState} from 'react';
import {useNavigate} from 'react-router';
import {NavLink} from 'react-router-dom';
import CustomInput from '../common/input/CustomInput';
import './Signincard.css';
import {AuthContext} from '../../contexts/AuthContext';
import {useApi} from '../../hooks/useApi';
import {INITIAL_SIGNIN_FORM_DATA} from '../../constants';

export default function Signincard() {
	const [formData, setFormData] = useState(INITIAL_SIGNIN_FORM_DATA);
	const [validationErrors, setValidationErrors] = useState('');
	const {errorMsg, makeRequest} = useApi(
		{
			url: `api/auth/signin`,
			method: 'post',
			data: formData,
		},
		true,
	);

	const {setIsAuthenticated} = useContext(AuthContext);
	const navigate = useNavigate();

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
		if (!formData.email) {
			return 'Please enter your email address';
		} else if (!/\S+@\S+\.\S+/.test(formData.email)) {
			return 'Please enter a valid email address';
		} else if (!formData.password) {
			return 'Please enter your password';
		} else {
			return null;
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
				navigate('/dashboard');
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
			<form onSubmit={handleSubmit}>
				<CustomInput
					className='inputs'
					type='email'
					name='email'
					id='email'
					label='Email'
					value={formData.email}
					onChange={handleFormChange}
				/>
				<CustomInput
					className='inputs'
					id='password'
					type='password'
					name='password'
					label='Password'
					value={formData.password}
					onChange={handleFormChange}
				/>
				<button className='login-btn' aria-label='Sign in to Dashboard'>
					Login
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
