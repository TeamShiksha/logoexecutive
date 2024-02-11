import PropTypes from 'prop-types';
import {useEffect, useState} from 'react';
import {HiMenu} from 'react-icons/hi';
import {Link, useNavigate} from 'react-router-dom';
import logo from '../../assets/images/business-man-logo.webp';
import './Header.css';
import Navbar from './Navbar';
import {loggedInNavbarItems, loggedOutNavbarItems} from '../../constants';

const Header = ({user, logoutUser}) => {
	const [showNavBar, setShowNavBar] = useState(window.innerWidth > 1000);
	const [headerBg, setHeaderBg] = useState(window.scrollY > 75);
	const navigate = useNavigate();

	const navbarItems = user ? loggedInNavbarItems : loggedOutNavbarItems;

	const toggleShowNavBar = () => {
		setShowNavBar((prev) => !prev);
	};

	const changeHeaderBg = () => {
		window.scrollY > 75 ? setHeaderBg(true) : setHeaderBg(false);
	};

	const handleLogout = () => {
		logoutUser();
		navigate('/signin');
	};

	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth > 1000) {
				setShowNavBar(true);
			} else {
				setShowNavBar(false);
			}
		};
		window.addEventListener('resize', handleResize);
		window.addEventListener('scroll', changeHeaderBg);
		return () => {
			window.removeEventListener('resize', handleResize);
			window.removeEventListener('scroll', changeHeaderBg);
		};
	}, []);

	return (
		<header className={headerBg ? 'header bg' : 'header'}>
			<Link to='/' className='logo'>
				<img src={logo} alt='brand logo'/>
				<h2>LogoExecutive</h2>
			</Link>
			<div className='navbar-container'>
				{showNavBar && <Navbar navbarItems={navbarItems} />}
				<div className='cta-container'>
					<button
						onClick={user ? handleLogout : () => navigate('/signin')}
						className='cta-button'
					>
						{user ? 'Logout' : 'Get Started'}
					</button>

					<HiMenu onClick={toggleShowNavBar} className='burger-menu' />
				</div>
			</div>
		</header>
	);
};

export default Header;

Header.propTypes = {
	user: PropTypes.string,
	logoutUser: PropTypes.func,
};
