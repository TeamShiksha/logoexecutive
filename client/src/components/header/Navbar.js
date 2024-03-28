import PropTypes from 'prop-types';
import {NavLink} from 'react-router-dom';

function Navbar({navbarItems}) {
	return (
		<nav className='navbar-menu'>
			{navbarItems?.map((item, index) => (
				<NavLink key={index} to={item.link} className='nav-links'>
					{item.name}
				</NavLink>
			))}
		</nav>
	);
}

Navbar.propTypes = {
	navbarItems: PropTypes.arrayOf(
		PropTypes.shape({
			name: PropTypes.string.isRequired,
			link: PropTypes.string.isRequired,
		}),
	),
};

export default Navbar;
