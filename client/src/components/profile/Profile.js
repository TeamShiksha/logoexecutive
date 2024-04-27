import {useContext, useEffect, useState} from 'react';
import CustomInput from '../common/input/CustomInput';
import './Profile.css';
import {UserContext} from '../../contexts/UserContext';
import {INITIAL_UPDATE_PROFILE_FORM_DATA} from '../../constants';
import {useApi} from '../../hooks/useApi';

function Profile() {
	const [updateProfileData, setUpdateProfileData] = useState(
		INITIAL_UPDATE_PROFILE_FORM_DATA,
	);
	const [oldPassword, setOldPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [repeatNewPassword, setRepeatNewPassword] = useState('');
	const {userData, fetchUserData} = useContext(UserContext);
	const [validationErrors, setValidationErrors] = useState({});
	const {data, errorMsg, makeRequest, loading} = useApi({
		url: `api/user/update-profile`,
		method: 'patch',
		data: {
			firstName: updateProfileData.firstName,
			lastName: updateProfileData.lastName,
		},
	});

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

	const validateFormData = () => {
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
		setValidationErrors({});
		e.preventDefault();
		const error = validateFormData();
		if (error && Object.keys(error).length > 0) {
			setValidationErrors(error);
		} else {
			const success = await makeRequest();
			if (success) {
				setValidationErrors({});
			}
		}
	};

	return (
		<div className='profile-cont' data-testid='testid-profile'>
			<div className='profile-sub-cont'>
				<h2 className='profile-heading'>Profile</h2>
				<p
					className={`form-error ${Object.values(validationErrors).length > 0 || errorMsg ? '' : 'hidden'}`}
					aria-live='assertive'
					role='alert'
				>
					{Object.values(validationErrors)[0] || errorMsg || ' '}
				</p>
				<div className='profile-border-bottom'></div>
				<form onSubmit={handleUpdateProfile}>
					<CustomInput
						name='first name'
						type='text'
						id='first name'
						required
						label='first name'
						value={updateProfileData.firstName}
						disabled={loading}
						onChange={(e) =>
							setUpdateProfileData((prevData) => ({
								...prevData,
								firstName: e.target.value,
							}))
						}
					/>
					<CustomInput
						name='last name'
						type='text'
						id='last name'
						required
						label='last name'
						value={updateProfileData.lastName}
						disabled={loading}
						onChange={(e) =>
							setUpdateProfileData((prevData) => ({
								...prevData,
								lastName: e.target.value,
							}))
						}
					/>
					<CustomInput
						name='email'
						type='email'
						id='email'
						label='email'
						required
						value={updateProfileData.email}
						onChange={(e) =>
							setUpdateProfileData((prevData) => ({
								...prevData,
								email: e.target.value,
							}))
						}
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
			<div className='profile-sub-cont'>
				<h2 className='profile-heading'>Change Password</h2>
				<div className='profile-border-bottom'></div>
				<form>
					<CustomInput
						name='old password'
						type='password'
						id='old password'
						label='old password'
						value={oldPassword}
						required
						onChange={(e) => setOldPassword(e.target.value)}
					/>

					<CustomInput
						name='new password'
						type='password'
						id='new password'
						label='new password'
						value={newPassword}
						required
						onChange={(e) => setNewPassword(e.target.value)}
					/>

					<CustomInput
						name='repeat new password'
						type='password'
						id='repeat new password'
						label='repeat new password'
						value={repeatNewPassword}
						required
						onChange={(e) => setRepeatNewPassword(e.target.value)}
					/>
					<button className='profile-button' type='submit'>
						Save
					</button>
				</form>
			</div>
		</div>
	);
}

export default Profile;
