import Demo from '../../components/demo/Demo';
import {HeroSection} from '../../components/herosection/HeroSection';
import './Home.css';
import FAQs from '../../components/faqs/FAQs';

export const Home = () => {
	return (
		<div className='home-container'>
			<HeroSection />
			<Demo />
			<FAQs />
		</div>
	);
};
