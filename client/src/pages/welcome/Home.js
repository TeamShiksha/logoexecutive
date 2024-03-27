import Demo from '../../components/demo/Demo';
import HeroSection from '../../components/herosection/HeroSection';
import './Home.css';
import FAQs from '../../components/faqs/FAQs';

function Home() {
	return (
		<div className='home-container'>
			<HeroSection />
			<Demo />
			<FAQs />
		</div>
	);
};

export default Home;