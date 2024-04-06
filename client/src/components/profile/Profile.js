import {useState} from 'react';
import CustomInput from '../common/input/CustomInput';
import './Profile.css';
import {useApi} from '../../hooks/useApi';

function Profile() {
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [email, setEmail] = useState('');
	const [validationErrors, setValidationErrors] = useState('');
	const [oldPassword, setOldPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [repeatNewPassword, setRepeatNewPassword] = useState('');

	const {loading, errorMsg, makeRequest} = useApi(
		{
			url: 'api/user/update-profile',
			data: {firstName, lastName, email},
			method: 'patch',
		},
		true,
	);

	const validateFormData = () => {
		if (firstName && !/^[a-zA-Z]+$/.test(firstName)) {
			return 'First name can only contain letters';
		}
		if (lastName && !/^[a-zA-Z]+$/.test(lastName)) {
			return 'Last name can only contain letters';
		}
		if (email && !/\S+@\S+\.\S+/.test(email))
			return 'Please enter a valid email';
		return null;
	};

	const handleUpdateProfile = async (e) => {
		e.preventDefault();
		const errorMessage = validateFormData();
		if (errorMessage) {
			setValidationErrors(errorMessage);
			return;
		}
		try {
			const success = await makeRequest();
			if (success) {
				setFirstName('');
				setLastName('');
				setEmail('');
			}
		} catch (error) {
			console.log('error updating profile', error);
		}
	};

	console.log('validation', validationErrors);
	return (
		<div className='profile-cont' data-testid='testid-profile'>
			<div className='profile-sub-cont'>
				<h2 className='profile-heading'>Profile</h2>
				<div className='profile-border-bottom'></div>
				<p
					className={`input-error ${validationErrors || errorMsg ? 'block' : 'hidden'}`}
					aria-live='assertive'
					role='alert'
				>
					{validationErrors || errorMsg || ' '}
				</p>
				<form onSubmit={handleUpdateProfile}>
					<CustomInput
						name='first name'
						type='text'
						id='first name'
						label='first name'
						value={firstName}
						disabled={loading}
						onChange={(e) => setFirstName(e.target.value)}
					/>
					<CustomInput
						name='last name'
						type='text'
						id='last name'
						label='last name'
						value={lastName}
						disabled={loading}
						onChange={(e) => setLastName(e.target.value)}
					/>
					<CustomInput
						name='email'
						type='email'
						id='email'
						label='email'
						value={email}
						disabled={loading}
						onChange={(e) => setEmail(e.target.value)}
					/>
					<button className='profile-button' type='submit' disabled={loading}>
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
