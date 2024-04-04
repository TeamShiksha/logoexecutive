import Banner from '../../assets/images/Banner.jpg';
import './Herosection.css';

function HeroSection() {
	return (
		<div className='hero-container'>
			<div className='hero-box'>
				<h1 className='hero-tagline'>
					Empower Your Branding: Logo Executive Where Logos Shine in Every Size
				</h1>
				<p className='hero-description' data-testid='hero-description'>
					Logo Executive is your partner in logo exploration. Our platform
					boasts a collection of APIs designed to simplify the process of
					obtaining company logos. Generate API keys and access logos in various
					sizes and formats, all while staying in control of your budget.
					Elevate your brand with Logo Executive!
				</p>
			</div>
			<img className='hero-image' src={Banner} alt='hero' />
		</div>
	);
}

export default HeroSection;
