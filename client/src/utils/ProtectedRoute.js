import PropTypes from 'prop-types';
import {useContext} from 'react';
import {AuthContext} from '../contexts/AuthContext';
import {Navigate, useLocation} from 'react-router';

function ProtectedRoute({children}) {
	const {isAuthenticated} = useContext(AuthContext);
	const location = useLocation();
	return isAuthenticated ? (
		children
	) : (
		<Navigate to='/signin' replace state={{path: location.pathname}} />
	);
}

ProtectedRoute.propTypes = {
	children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
