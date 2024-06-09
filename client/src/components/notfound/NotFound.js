import {useNavigate} from 'react-router-dom';
import './NotFound.css';
import Logo from '../../assets/images/business-man-logo.webp';

const NotFound = () => {
	const navigate = useNavigate();
	const handleHomePageBtnClick = () => {
		navigate('/home');
	};
	return (
		<div className='error-container'>
			<div className='error-img-container'>
				<h1>4</h1>
				<img className='err-img' src={Logo} alt='error' />
				<h1>4</h1>
			</div>
			<h1>Oops! Page Not Found</h1>
			<p>
				Sorry, the page you are trying to access does not exist.
				<br></br>
				Let's head back home.
			</p>
			<button className='homepage-btn' onClick={handleHomePageBtnClick}>
				Go to homepage
			</button>
		</div>
	);
};
export default NotFound;
