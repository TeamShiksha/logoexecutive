import {useContext} from 'react';
import Signincard from '../../components/signincard/Signincard';
import './Signin.css';
import {Navigate} from 'react-router-dom';
import {AuthContext} from '../../contexts/AuthContext';

export default function Signin() {
	const {isAuthenticated} = useContext(AuthContext);

	return !isAuthenticated ? (
		<div className='login-main'>
			<Signincard />
		</div>
	) : (
		<Navigate to='/dashboard' />
	);
}
