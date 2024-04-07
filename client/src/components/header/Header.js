import {useContext, useEffect, useRef, useState} from 'react';
import {HiMenu} from 'react-icons/hi';
import {Link, useNavigate} from 'react-router-dom';
import logo from '../../assets/images/business-man-logo.webp';
import Navbar from './Navbar';
import {loggedInNavbarItems, loggedOutNavbarItems} from '../../constants';
import {AuthContext} from '../../contexts/AuthContext';
import './Header.css';
import Dropdown from './Dropdown';

function Header() {
	const [showNavBar, setShowNavBar] = useState(window.innerWidth > 1000);
	const [headerBg, setHeaderBg] = useState(window.scrollY > 75);
	const {isAuthenticated, logout} = useContext(AuthContext);
	const [showAccount, setShowAccount] = useState(false);
	const navigate = useNavigate();
	const navbarItems = isAuthenticated
		? loggedInNavbarItems
		: loggedOutNavbarItems;

	const dropdownRef = useRef(null);
	const accountButtonRef = useRef(null);
	const toggleShowNavBar = () => {
		setShowAccount(false);
		setShowNavBar((prev) => !prev);
	};
	const changeHeaderBg = () => {
		window.scrollY > 75 ? setHeaderBg(true) : setHeaderBg(false);
	};
	const handleLogout = () => {
		logout();
	};
	const toggleShowAccount = () => {
		if (window.innerWidth <= 1000) setShowNavBar(false);
		setShowAccount((prev) => !prev);
	};

	const handleHeaderButtonClick = () => {
		isAuthenticated ? toggleShowAccount() : navigate('/signin');
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
		const handleClickOutside = (event) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target) &&
				accountButtonRef.current &&
				!accountButtonRef.current.contains(event.target)
			) {
				setShowAccount(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			window.removeEventListener('resize', handleResize);
			window.removeEventListener('scroll', changeHeaderBg);
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	return (
		<header className={headerBg ? 'header bg' : 'header'}>
			<Link to='/' className='logo'>
				<img src={logo} alt='brand logo' />
				<h2>LogoExecutive</h2>
			</Link>
			<div className='navbar-container'>
				{showNavBar && <Navbar navbarItems={navbarItems} />}
				<div className='cta-container'>
					<button
						onClick={handleHeaderButtonClick}
						className='cta-button'
						ref={accountButtonRef}
					>
						{isAuthenticated ? 'Account' : 'Get Started'}
					</button>
					<HiMenu
						onClick={toggleShowNavBar}
						className='burger-menu'
						data-testid='burger-menu'
					/>
					{showAccount && (
						<ul className='dropdown' ref={dropdownRef}>
							<Dropdown
								handleLogout={handleLogout}
								toggleShowAccount={toggleShowAccount}
							/>
						</ul>
					)}
				</div>
			</div>
		</header>
	);
}

export default Header;
