import axios from 'axios';
import {useContext, useState} from 'react';
import {useNavigate} from 'react-router';
import {NavLink} from 'react-router-dom';
import CustomInput from '../common/input/CustomInput';
import './Signincard.css';
import {AuthContext} from '../../contexts/AuthContext';

const BASE_API_URL = process.env.REACT_APP_BASE_API_URL;

export default function Signincard() {
	const INITIAL_FORM_DATA = {
		email: '',
		password: '',
	};
	const [formData, setFormData] = useState(INITIAL_FORM_DATA);
	const [errorMsg, setErrorMsg] = useState('');
	const [submitting, setSubmitting] = useState(false);

	const {setIsAuthenticated} = useContext(AuthContext);
	const navigate = useNavigate();

	const handleFormChange = (e) => {
		const {name, value} = e.target;

		// Trim leading and trailing whitespace from the input value
		const trimmedValue = value.trim();

		setErrorMsg(null);

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
		setErrorMsg(null);
		e.preventDefault();
		const error = validateFormData();
		if (error) {
			setErrorMsg(error);
		} else {
			setSubmitting(true);
			try {
				const response = await axios.post(
					`${BASE_API_URL}/auth/signin`,
					formData,
					{
						withCredentials: true,
					},
				);
				if (response.status === 200) {
					setIsAuthenticated(true);
				}
				setFormData(INITIAL_FORM_DATA);
				navigate('/dashboard');
				setSubmitting(false);
			} catch (err) {
				setSubmitting(false);
				console.error(err);
				if (err?.response) {
					setErrorMsg(err?.response?.data?.message);
				} else {
					setErrorMsg(err?.message);
				}
			}
		}
	};

	return (
		<div className='inputlogin'>
			<h3 className='head3'>Sign in to dashboard</h3>
			<p
				className={`input-error ${errorMsg ? '' : 'hidden'}`}
				aria-live='assertive'
				role='alert'
			>
				{errorMsg || ' '}
			</p>
			<form onSubmit={handleSubmit}>
				<CustomInput
					className='inputs'
					type='email'
					name='email'
					label='email'
					value={formData.email}
					onChange={handleFormChange}
				/>
				<CustomInput
					className='inputs'
					type='password'
					name='password'
					label='password'
					value={formData.password}
					onChange={handleFormChange}
				/>
				<button
					className='login-btn'
					aria-label='Sign in to Dashboard'
					disabled={submitting}
				>
					{submitting ? 'Submitting...' : 'Login'}
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
