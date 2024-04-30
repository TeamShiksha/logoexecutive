import PropTypes from 'prop-types';
import {useState} from 'react';
import {useApi} from '../../hooks/useApi';
import CustomInput from '../common/input/CustomInput';

const UpdateProfileForm = ({updateProfileData, setUpdateProfileData}) => {
	const [validationErrors, setValidationErrors] = useState({});
	const {data, errorMsg, makeRequest, loading} = useApi({
		url: `api/user/update-profile`,
		method: 'patch',
		data: {
			firstName: updateProfileData.firstName,
			lastName: updateProfileData.lastName,
		},
	});
	const [isUpdateProfileSuccess, setIsUpdateProfileSuccess] = useState(false);

	const validateUpdateProfileFormData = () => {
		if (updateProfileData.firstName === '') {
			return {firstName: 'First name is required'};
		} else if (/[^a-zA-Z\s]/.test(updateProfileData.firstName)) {
			return {firstName: 'First name should only contain alphabets'};
		} else if (
			updateProfileData.firstName.length < 1 ||
			updateProfileData.firstName.length > 20
		) {
			return {firstName: 'First name should be 1 to 20 characters long'};
		}
		if (updateProfileData.lastName === '') {
			return {lastName: 'Last name is required'};
		} else if (/[^a-zA-Z]/.test(updateProfileData.lastName)) {
			return {lastName: 'Last name should only contain alphabets'};
		} else if (
			updateProfileData.lastName.length < 1 ||
			updateProfileData.lastName.length > 20
		) {
			return {lastName: 'Last name should be 1 to 20 characters long'};
		}
		return null;
	};
	const handleUpdateProfile = async (e) => {
		setIsUpdateProfileSuccess(false);
		setValidationErrors({});
		e.preventDefault();
		const error = validateUpdateProfileFormData();
		if (error && Object.keys(error).length > 0) {
			setValidationErrors(error);
		} else {
			const success = await makeRequest();
			if (success) {
				setValidationErrors({});
				setIsUpdateProfileSuccess(true);
			}
		}
	};

	const handleFormChange = (e) => {
		setValidationErrors({});
		const {name, value} = e.target;
		setUpdateProfileData((prev) => {
			return {
				...prev,
				[name]: value,
			};
		});
	};

	return (
		<div className='profile-sub-cont'>
			<h2 className='profile-heading'>Profile</h2>
			<p
				className={`${isUpdateProfileSuccess ? 'profile-update-success' : 'form-error'} ${Object.values(validationErrors).length > 0 || errorMsg ? '' : 'hidden'}`}
				aria-live='assertive'
				role='alert'
			>
				{(isUpdateProfileSuccess && data.message) ||
					Object.values(validationErrors)[0] ||
					errorMsg ||
					' '}
			</p>
			<form onSubmit={handleUpdateProfile}>
				<CustomInput
					name='firstName'
					type='text'
					id='first name'
					required
					label='first name'
					value={updateProfileData.firstName}
					disabled={loading}
					onChange={handleFormChange}
				/>
				<CustomInput
					name='lastName'
					type='text'
					id='last name'
					required
					label='last name'
					value={updateProfileData.lastName}
					disabled={loading}
					onChange={handleFormChange}
				/>
				<CustomInput
					name='email'
					type='email'
					id='email'
					label='email'
					required
					value={updateProfileData.email}
					onChange={handleFormChange}
					disabled={
						loading ||
						(updateProfileData.email && updateProfileData.email.length > 0)
					}
				/>
				<button className='profile-button' type='submit'>
					Save
				</button>
			</form>
		</div>
	);
};

UpdateProfileForm.propTypes = {
	updateProfileData: PropTypes.object.isRequired,
	setUpdateProfileData: PropTypes.func.isRequired,
};

export default UpdateProfileForm;
