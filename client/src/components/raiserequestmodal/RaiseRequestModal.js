import Modal from '../common/modal/Modal';
import CustomInput from '../common/input/CustomInput';
import {useState} from 'react';
import {useApi} from '../../hooks/useApi';
import {isValidEmail, isValidCompanyUrl} from '../../utils/helpers';
import './RaiseRequestModal.css';
import {INITIAL_RAISE_REQUEST_FORM_DATA} from '../../constants';

function RaiseRequestModal({modalOpen, setModal}) {
	const [formData, setFormData] = useState(INITIAL_RAISE_REQUEST_FORM_DATA);
	const [validationErrors, setValidationErrors] = useState('');
	const {errorMsg, makeRequest, loading} = useApi({
		url: `api/logo-requests`,
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
		if (formData.companyUrl === '') {
			return 'Company URL is required';
		} else if (!isValidCompanyUrl(formData.companyUrl)) {
			return 'Invalid URL';
		}
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		setValidationErrors(null);
		const error = validateFormData();
		if (error) {
			setValidationErrors(error);
		} else {
			const success = makeRequest();
			if (success) {
				setFormData(INITIAL_RAISE_REQUEST_FORM_DATA);
			}
		}
	};

	return (
		<Modal
			modalOpen={modalOpen}
			setModal={setModal}
			containerClassName='raise-request-modal-container'
		>
			<p>
				<strong>Didn't Find the Logo? Request It Here</strong>
			</p>
			<p
				className={`input-error ${validationErrors || errorMsg ? '' : 'hidden'}`}
				aria-live='assertive'
				role='alert'
			>
				{validationErrors || errorMsg || ' '}
			</p>
			<form onSubmit={handleSubmit} className='raise-request-form'>
				<CustomInput
					type='email'
					label='email'
					value={formData.email}
					name='email'
					required
					onChange={handleFormChange}
				/>
				<CustomInput
					type='url'
					label='company url'
					value={formData.companyUrl}
					name='companyUrl'
					required
					onChange={handleFormChange}
				/>
				<button
					disabled={loading}
					className='raise-request-modal-submit-button'
					type='submit'
				>
					Submit
				</button>
			</form>
		</Modal>
	);
}

export default RaiseRequestModal;
