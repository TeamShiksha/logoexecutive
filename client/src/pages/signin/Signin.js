import {useContext} from 'react';
import {Navigate} from 'react-router-dom';
import Signincard from '../../components/signincard/Signincard';
import {AuthContext} from '../../contexts/AuthContext';
import './Signin.css';

function Signin() {
	const {isAuthenticated} = useContext(AuthContext);
	return !isAuthenticated ? (
		<div className='login-main' data-testid='testid-signin'>
			<Signincard />
		</div>
	) : (
		<Navigate to='/dashboard' />
	);
}

export default Signin;
