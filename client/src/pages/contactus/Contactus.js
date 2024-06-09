import {useContext, useEffect, useState} from 'react';
import {FiArrowRight} from 'react-icons/fi';
import CustomInput from '../../components/common/input/CustomInput';
import {Link} from 'react-router-dom';
import {INITIAL_CONTACTUS_FORM_DATA} from '../../constants';
import {
	isSQLInjectionAttempt,
	isValidEmail,
	isValidMessage,
} from '../../utils/helpers';
import {useApi} from '../../hooks/useApi';
import {UserContext} from '../../contexts/UserContext';
import {AuthContext} from '../../contexts/AuthContext';
import './Contactus.css';

function Contactus() {
	const [formData, setFormData] = useState(INITIAL_CONTACTUS_FORM_DATA);
	const [validationError, setValidationError] = useState('');
	const {errorMsg, makeRequest, data, loading, isSuccess} = useApi(
		{
			url: `api/public/contact-us`,
			method: 'post',
			data: formData,
		},
		true,
	);
	const {isAuthenticated} = useContext(AuthContext);
	const {userData, fetchUserData} = useContext(UserContext);

	useEffect(() => {
		if (isAuthenticated) {
			fetchUserData();
		}
	}, [isAuthenticated, errorMsg, isSuccess]);

	useEffect(() => {
		if (isAuthenticated && userData) {
			setFormData((prevFormData) => ({
				...prevFormData,
				name: userData.firstName,
				email: userData.email,
			}));
		}
	}, [isAuthenticated, userData]);

	const handleFormChange = (e) => {
		setValidationError(null);
		const {name, value} = e.target;
		setFormData((prev) => {
			return {
				...prev,
				[name]: value,
			};
		});
	};

	const validateFormData = () => {
		const trimmedName = formData.name;
		if (trimmedName === '') {
			return 'Name is required';
		} else if (/[^a-zA-Z\s]/.test(trimmedName)) {
			return 'Name should only contain alphabets';
		} else if (trimmedName.length < 1 || trimmedName.length > 20) {
			return 'Name should be 1 to 20 characters long';
		}

		const trimmedEmail = formData.email;
		if (trimmedEmail === '') {
			return 'Email is required';
		} else if (trimmedEmail.length > 50) {
			return 'Email should not be more than 50 characters long';
		} else if (!isValidEmail(trimmedEmail)) {
			return 'Invalid email format';
		}
		const trimmedMessage = formData.message.trim();
		if (trimmedMessage === '') {
			return 'Message is required';
		} else if (trimmedMessage.length < 20) {
			return 'Message should be at least 20 characters';
		} else if (trimmedMessage.length > 500) {
			return 'Message must be 500 or fewer characters';
		} else if (!isValidMessage(trimmedMessage)) {
			return 'Message should only contain alphabets';
		} else if (isSQLInjectionAttempt(trimmedMessage)) {
			return 'Message contains SQL keywords or characters';
		}
	};

	const sendMessage = (e) => {
		e.preventDefault();
		setValidationError(null);
		const error = validateFormData();
		if (error) {
			setValidationError(error);
		} else {
			const success = makeRequest();
			if (success) {
				setFormData(INITIAL_CONTACTUS_FORM_DATA);
			}
		}
	};

	return (
		<div className='contact-main-cont' id='contactus'>
			<div className='contact-subcont-first'>
				<h3>Contact us</h3>
			</div>
			<div className='contact-subcont-second'>
				<form
					onSubmit={sendMessage}
					className='contact-subcont-second-first-col'
					noValidate
				>
					<p
						className='contact-password-error'
						aria-live='assertive'
						role='alert'
					>
						{errorMsg || validationError || ''}
					</p>
					{isSuccess && (
						<p
							className='contact-password-success'
							aria-live='assertive'
							role='alert'
						>
							{data?.message}
						</p>
					)}
					<div className='contact-input-field'>
						<CustomInput
							name='name'
							label='name'
							type='text'
							id='name'
							value={formData.name}
							onChange={handleFormChange}
							disabled={loading}
						/>
						<CustomInput
							name='email'
							label='email'
							type='text'
							id='email'
							value={formData.email}
							onChange={handleFormChange}
							disabled={loading}
						/>
					</div>
					<div className='contact-textarea'>
						<textarea
							id='message'
							name='message'
							cols='30'
							rows='12'
							value={formData.message}
							onChange={handleFormChange}
							className='textarea'
							disabled={loading}
							required
						/>
						<label className='message-label' htmlFor='message'>
							message
						</label>
					</div>
					<button className='contact-button' disabled={loading}>
						Send Message
					</button>
				</form>
				<div className='contact-subcont-second-sec-col'>
					<div className='contact-get-in-touch contact-text'>
						<h3>Get in touch</h3>
						<p>
							We’re always here to help. Contact us if you are experiencing
							issues with our product or have any questions.
						</p>
						<div className='custom-link'>
							<Link to='/home#demo'>Get a demo</Link>
							<FiArrowRight
								className='contact-arrow-icon'
								data-testid='contact-arrow-icon'
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Contactus;
