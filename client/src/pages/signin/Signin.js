import Signincard from '../../components/signincard/Signincard';
import './Signin.css';
import PropTypes from 'prop-types';

export const Signin = ({setUser}) => {
	return (
		<div className='login-main'>
			<Signincard setUser={setUser} />
		</div>
	);
};

Signin.propTypes = {
	setUser: PropTypes.func,
};
