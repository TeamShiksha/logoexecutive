import {useState} from 'react';
import CustomInput from '../common/input/CustomInput';
import './Profile.css';

const Profile = () => {
	const [firstName, setfirstName] = useState('');
	const [lastName, setlastName] = useState('');
	const [email, setEmail] = useState('');
	const [oldPassword, setOldPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [repeatNewPassword, setRepeatNewPassword] = useState('');

	return (
		<div className='profile-cont'>
			<div className='profile-sub-cont'>
				<h2 className='profile-heading'>Profile</h2>
				<div className='profile-border-bottom'></div>
				<form>
					<CustomInput
						name='first name'
						type='text'
						id='first name'
						required
						label='first name'
						value={firstName}
						onChange={(e) => setfirstName(e.target.value)}
					/>
					<CustomInput
						name='last name'
						type='text'
						id='last name'
						required
						label='last name'
						value={lastName}
						onChange={(e) => setlastName(e.target.value)}
					/>
					<CustomInput
						name='email'
						type='email'
						id='email'
						label='email'
						required
						value={email}
						onChange={(e) => setEmail(e.target.value)}
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
};

export default Profile;
