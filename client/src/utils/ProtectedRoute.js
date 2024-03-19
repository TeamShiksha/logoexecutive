import PropTypes from 'prop-types';
import {useContext} from 'react';
import {AuthContext} from '../contexts/AuthContext';
import {Navigate} from 'react-router';

function ProtectedRoute({children}) {
	const {isAuthenticated} = useContext(AuthContext);
	return isAuthenticated ? children : <Navigate to='/signin' />;
}

ProtectedRoute.propTypes = {
	children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
