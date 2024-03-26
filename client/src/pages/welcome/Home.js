import {useContext} from 'react';
import {Navigate} from 'react-router-dom';
import Demo from '../../components/demo/Demo';
import {HeroSection} from '../../components/herosection/HeroSection';
import FAQs from '../../components/faqs/FAQs';
import {AuthContext} from '../../contexts/AuthContext';
import './Home.css';

export const Home = () => {
	const {isAuthenticated} = useContext(AuthContext);
	return !isAuthenticated ? (
		<div className='home-container'>
			<HeroSection />
			<Demo />
			<FAQs />
		</div>
	) : (
		<Navigate to='/dashboard' />
	);
};
