import Demo from '../../components/demo/Demo';
import HeroSection from '../../components/herosection/HeroSection';
import FAQs from '../../components/faqs/FAQs';
import './Home.css';

function Home() {
	return (
		<div className='home-container' data-testid='home-container'>
			<HeroSection />
			<Demo />
			<FAQs />
		</div>
	);
}

export default Home;
