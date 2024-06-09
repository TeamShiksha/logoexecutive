import PropTypes from 'prop-types';
import {useContext, useEffect} from 'react';
import {AuthContext} from '../contexts/AuthContext';
import {Navigate, useLocation} from 'react-router';
import {UserContext} from '../contexts/UserContext';
import Spinner from '../components/spinner/Spinner';

function ProtectedRoute({adminOnly, children}) {
	const {isAuthenticated} = useContext(AuthContext);
	const {userData, loading, fetchUserData} = useContext(UserContext);
	const location = useLocation();

	useEffect(() => {
		if (adminOnly && isAuthenticated && (loading || !userData)) {
			fetchUserData();
		}
	}, []);

	if (adminOnly && isAuthenticated && (loading || !userData)) {
		return <Spinner />;
	}

	if (adminOnly && isAuthenticated) {
		if (userData.userType === 'ADMIN') {
			return children;
		} else {
			return <Navigate to='/home' replace={true} />;
		}
	}

	return isAuthenticated ? (
		children
	) : (
		<Navigate to='/signin' replace state={{path: location.pathname}} />
	);
}

ProtectedRoute.propTypes = {
	children: PropTypes.node.isRequired,
	adminOnly: PropTypes.bool,
};

export default ProtectedRoute;
