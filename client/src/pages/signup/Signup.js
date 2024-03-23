import {useContext} from 'react';
import {AuthContext} from '../../contexts/AuthContext';
import {Navigate} from 'react-router';
import SignupForm from '../../components/signup/SignupForm';

export const Signup = () => {
	const {isAuthenticated} = useContext(AuthContext);

	return !isAuthenticated ? <SignupForm /> : <Navigate to={'/dashboard'} />;
};
