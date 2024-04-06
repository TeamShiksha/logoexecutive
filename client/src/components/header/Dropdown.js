import {Link} from 'react-router-dom';
import PropTypes from 'prop-types';

const Dropdown = ({handleLogout, toggleShowAccount}) => {
	const handleLogoutClick = () => {
		handleLogout();
		toggleShowAccount();
	};
	return (
		<ul className='dropdown'>
			<li key={0} className='menu-items'>
				<Link
					to='/profile'
					onClick={toggleShowAccount}
					data-testid='profile-link'
				>
					<div>Profile</div>
				</Link>
			</li>
			<li
				key={1}
				className='menu-items'
				onClick={handleLogoutClick}
				data-testid='logout-option'
			>
				<div>Logout</div>
			</li>
		</ul>
	);
};

Dropdown.propTypes = {
	handleLogout: PropTypes.func.isRequired,
	toggleShowAccount: PropTypes.func.isRequired,
};

export default Dropdown;
