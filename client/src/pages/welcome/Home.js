import Demo from '../../components/demo/Demo';
import HeroSection from '../../components/herosection/HeroSection';
import FAQs from '../../components/faqs/FAQs';
import './Home.css';

function Home() {
	return (
		<div data-testid='home-container' className='home-container'>
			<HeroSection />
			<Demo />
			<FAQs />
		</div>
	);
}

export default Home;
