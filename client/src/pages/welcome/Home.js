import {useContext} from 'react';
import {Navigate} from 'react-router-dom';
import Demo from '../../components/demo/Demo';
import {HeroSection} from '../../components/herosection/HeroSection';
import FAQs from '../../components/faqs/FAQs';
import {AuthContext} from '../../contexts/AuthContext';
import './Home.css';

const Home = () => {
	const {isAuthenticated} = useContext(AuthContext);

	if (isAuthenticated) {
		return <Navigate to='/dashboard' />;
	}
	return (
		<div className='home-container'>
			<HeroSection />
			<Demo />
			<FAQs />
		</div>
	);
};

export default Home;
