import {useContext, useEffect, useState, useRef} from 'react';
import './Profile.css';
import {UserContext} from '../../contexts/UserContext';
import {INITIAL_UPDATE_PROFILE_FORM_DATA} from '../../constants';
import {useApi} from '../../hooks/useApi';
import CustomInput from '../common/input/CustomInput';
import {isValidPassword} from '../../constants';

function Profile() {
	const [updateProfileData, setUpdateProfileData] = useState(
		INITIAL_UPDATE_PROFILE_FORM_DATA,
	);
	const [changeInInputField, setChangeInInputField] = useState(false);
	const {userData, fetchUserData} = useContext(UserContext);
	const [updateProfileValidationErrors, setUpdateProfileValidationErrors] =
		useState({});
	const [currPassword, setCurrPassword] = useState('');
	const [errorMessage, setErroMessage] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [repeatNewPassword, setRepeatNewPassword] = useState('');
	const didInputChanged = useRef(false);
	const {data, errorMsg, makeRequest, loading, isSuccess, setIsSuccess} =
		useApi({
			url: `api/user/update-profile`,
			method: 'patch',
			data: {
				firstName: updateProfileData.firstName,
				lastName: updateProfileData.lastName,
			},
		});
	const {
		data: updatePasswordData,
		errorMsg: updatePasswordErrorMsg,
		makeRequest: makeUpdatePasswordRequest,
		loading: updatePasswordLoading,
		isSuccess: updatePasswordIsSuccess,
	} = useApi({
		url: `api/user/update-password`,
		method: 'post',
		data: {
			currPassword: currPassword,
			newPassword: newPassword,
			confirmPassword: repeatNewPassword,
		},
	});

	function onSubmitHandler(e) {
		e.preventDefault();
		setChangeInInputField(false);
		makeUpdatePasswordRequest();
	}
	useEffect(() => {
		!changeInInputField && setChangeInInputField(true);
		if (currPassword || newPassword || repeatNewPassword) {
			didInputChanged.current = true;
		}
		if (didInputChanged.current) {
			if (!currPassword.match(isValidPassword)) {
				setErroMessage('Invalid old password');
			} else if (!newPassword.match(isValidPassword)) {
				setErroMessage('Invalid new password');
			} else if (newPassword !== repeatNewPassword) {
				setErroMessage('Password does not match');
			} else if (currPassword === newPassword) {
				setErroMessage('New password cannot be same as old password');
			} else {
				setErroMessage('');
			}
		}
	}, [currPassword, newPassword, repeatNewPassword]);

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
				<div
					className={`${updatePasswordIsSuccess && !changeInInputField ? 'profile-update-success' : 'input-errors'}`}
				>
					<span data-testid='password-error'>
						{errorMessage ||
							(!changeInInputField &&
								(updatePasswordIsSuccess
									? updatePasswordData.message
									: updatePasswordErrorMsg))}
					</span>
				</div>
				<form onSubmit={onSubmitHandler}>
					<CustomInput
						name='old password'
						type='password'
						data-testid='old-password'
						id='old password'
						label='old password'
						value={currPassword}
						required
						onChange={(e) => setCurrPassword(e.target.value)}
					/>

					<CustomInput
						name='new password'
						type='password'
						id='new password'
						data-testid='new-password'
						label='new password'
						value={newPassword}
						required
						onChange={(e) => setNewPassword(e.target.value)}
					/>

					<CustomInput
						name='repeat new password'
						type='password'
						id='repeat new password'
						data-testid='repeat-new-password'
						label='repeat new password'
						value={repeatNewPassword}
						required
						onChange={(e) => setRepeatNewPassword(e.target.value)}
					/>
					<button
						disabled={errorMessage || updatePasswordLoading}
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
