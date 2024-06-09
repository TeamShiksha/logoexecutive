import {useContext, useEffect, useState} from 'react';
import './Profile.css';
import {UserContext} from '../../contexts/UserContext';
import {
	INITIAL_UPDATE_PROFILE_FORM_DATA,
	INITIAL_UPDATE_PASSWORD_FORM_DATA,
} from '../../constants';
import {useApi} from '../../hooks/useApi';
import CustomInput from '../common/input/CustomInput';
import {isValidPassword} from '../../constants';

function Profile() {
	const [updateProfileData, setUpdateProfileData] = useState(
		INITIAL_UPDATE_PROFILE_FORM_DATA,
	);
	const {userData, fetchUserData} = useContext(UserContext);
	const [updateProfileValidationErrors, setUpdateProfileValidationErrors] =
		useState({});
	const [errorMessage, setErroMessage] = useState('');
	const [passwordFields, setPasswordFields] = useState(
		INITIAL_UPDATE_PASSWORD_FORM_DATA,
	);
	const {data, errorMsg, makeRequest, loading, isSuccess, setIsSuccess} =
		useApi(
			{
				url: `api/user/update-profile`,
				method: 'patch',
				data: {
					firstName: updateProfileData.firstName,
					lastName: updateProfileData.lastName,
				},
			},
			true,
		);
	const {
		data: updatePasswordData,
		errorMsg: updatePasswordErrorMsg,
		makeRequest: makeUpdatePasswordRequest,
		setIsSuccess: setUpdatePasswordIsSuccess,
		loading: updatePasswordLoading,
		isSuccess: updatePasswordIsSuccess,
	} = useApi(
		{
			url: `api/user/update-password`,
			method: 'post',
			data: passwordFields,
		},
		true,
	);

	function onSubmitHandler(e) {
		e.preventDefault();
		setUpdatePasswordIsSuccess(false);
		const error = validatePasswordFormData();
		setErroMessage(error);
		return (
			!error &&
			makeUpdatePasswordRequest().then((res) => {
				res && setPasswordFields(INITIAL_UPDATE_PASSWORD_FORM_DATA);
			})
		);
	}

	const handlePasswordChange = (e) => {
		const {name, value} = e.target;
		setPasswordFields((prev) => {
			return {
				...prev,
				[name]: value,
			};
		});
	};

	function validateUpdateProfileFormData() {
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
	}
	const validatePasswordFormData = () => {
		if (!passwordFields.currPassword.match(isValidPassword)) {
			return 'Invalid old password';
		} else if (!passwordFields.newPassword.match(isValidPassword)) {
			return 'Invalid new password';
		} else if (passwordFields.newPassword !== passwordFields.confirmPassword) {
			return 'Password does not match';
		} else if (passwordFields.currPassword === passwordFields.newPassword) {
			return 'New password cannot be same as old password';
		} else {
			return '';
		}
	};
	const handleUpdateProfile = async (e) => {
		setIsSuccess(false);
		setUpdateProfileValidationErrors({});
		e.preventDefault();
		const error = validateUpdateProfileFormData();
		if (error && Object.keys(error).length > 0) {
			setUpdateProfileValidationErrors(error);
		} else {
			const success = await makeRequest();
			if (success) {
				setUpdateProfileValidationErrors({});
			}
		}
	};

	const handleFormChange = (e) => {
		setUpdateProfileValidationErrors({});
		const {name, value} = e.target;
		setUpdateProfileData((prev) => {
			return {
				...prev,
				[name]: value,
			};
		});
	};

	useEffect(() => {
		fetchUserData();
	}, []);
	useEffect(() => {
		if (userData?.firstName)
			setUpdateProfileData((prevData) => ({
				...prevData,
				firstName: userData.firstName,
			}));
		if (userData?.lastName)
			setUpdateProfileData((prevData) => ({
				...prevData,
				lastName: userData.lastName,
			}));
		if (userData?.email)
			setUpdateProfileData((prevData) => ({
				...prevData,
				email: userData.email,
			}));
	}, [userData]);

	return (
		<div className='profile-cont' data-testid='testid-profile'>
			<div className='profile-sub-cont'>
				<h2 className='profile-heading'>Profile</h2>
				<p
					className={`${isSuccess ? 'profile-update-success' : 'form-error'} ${Object.values(updateProfileValidationErrors).length > 0 || errorMsg ? '' : 'hidden'}`}
					aria-live='assertive'
					role='alert'
				>
					{(isSuccess && data.message) ||
						Object.values(updateProfileValidationErrors)[0] ||
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
					<button
						className='profile-button'
						type='submit'
						data-testid='profile-button'
					>
						Save
					</button>
				</form>
			</div>
			<div className='profile-sub-cont'>
				<h2 className='profile-heading'>Change Password</h2>
				<span
					className={`${updatePasswordIsSuccess ? 'profile-update-success' : 'form-error'}`}
					data-testid='password-error'
				>
					{(updatePasswordIsSuccess && updatePasswordData.message) ||
						errorMessage ||
						updatePasswordErrorMsg ||
						' '}
				</span>
				<form noValidate onSubmit={onSubmitHandler}>
					<CustomInput
						name='currPassword'
						type='password'
						data-testid='old-password'
						id='old password'
						label='old password'
						value={passwordFields.currPassword}
						onChange={handlePasswordChange}
					/>

					<CustomInput
						name='newPassword'
						type='password'
						id='new password'
						data-testid='new-password'
						label='new password'
						value={passwordFields.newPassword}
						onChange={handlePasswordChange}
					/>

					<CustomInput
						name='confirmPassword'
						type='password'
						id='repeat new password'
						data-testid='repeat-new-password'
						label='repeat new password'
						value={passwordFields.confirmPassword}
						onChange={handlePasswordChange}
					/>
					<button
						disabled={updatePasswordLoading}
						className='profile-button'
						type='submit'
						data-testid='change-password-button'
					>
						Save
					</button>
				</form>
			</div>
		</div>
	);
}

export default Profile;
