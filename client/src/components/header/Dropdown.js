import {useNavigate} from 'react-router-dom';
import PropTypes from 'prop-types';
import DropDownItem from './DropDownItem';

const Dropdown = ({handleLogout, toggleShowAccount}) => {
	const navigate = useNavigate();
	const handleprofileClick = () => {
		toggleShowAccount();
		navigate('/profile');
	};
	const handleLogoutClick = () => {
		handleLogout();
		toggleShowAccount();
		navigate('/home');
	};
	return (
		<>
			<DropDownItem
				key='profile'
				option={'Profile'}
				handleClick={handleprofileClick}
				testId={'profile-link'}
			/>
			<DropDownItem
				key='logout'
				option={'Logout'}
				handleClick={handleLogoutClick}
				testId={'logout-option'}
			/>
		</>
	);
};

Dropdown.propTypes = {
	handleLogout: PropTypes.func.isRequired,
	toggleShowAccount: PropTypes.func.isRequired,
};

export default Dropdown;
