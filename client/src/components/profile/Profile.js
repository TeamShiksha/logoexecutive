import {useContext, useEffect, useState} from 'react';
import './Profile.css';
import {UserContext} from '../../contexts/UserContext';
import {INITIAL_UPDATE_PROFILE_FORM_DATA} from '../../constants';
import UpdateProfileForm from './UpdateProfileForm';
import ChangePasswordForm from './ChangePasswordForm';

function Profile() {
	const [updateProfileData, setUpdateProfileData] = useState(
		INITIAL_UPDATE_PROFILE_FORM_DATA,
	);
	const {userData, fetchUserData} = useContext(UserContext);

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
			<UpdateProfileForm
				updateProfileData={updateProfileData}
				setUpdateProfileData={setUpdateProfileData}
			/>
			<ChangePasswordForm />
		</div>
	);
}

export default Profile;
