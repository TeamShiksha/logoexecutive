import {NavLink} from 'react-router-dom';
import businessLogo from '../../assets/images/business-man-logo.webp';
import teamShiksha from '../../assets/images/teamshishalogo.webp';
import {footerColumns} from '../../constants';
import './Footer.css';

const Footer = () => {
	return (
		<footer className='footer'>
			<section className='footer-left'>
				{footerColumns.map((footerColumn, index) => (
					<ul key={index}>
						{footerColumn.map((footerLink, index) => (
							<li key={index} className='footer-items'>
								<NavLink className='nav-links' to={footerLink.link}>
									{footerLink.name}
								</NavLink>
							</li>
						))}
					</ul>
				))}
			</section>
			<section className='footer-right'>
				<div className='footer-right-heading-container'>
					<img src={businessLogo} alt='Brand logo' />
					<h4>
						Empower Your Branding: Logo Executive Where Logos Shine in Every
						Size
					</h4>
				</div>
				<section
					className='poweredBy'
					onClick={() => {
						window.open('https://team.shiksha', '_blank');
					}}
				>
					Powered By
					<img src={teamShiksha} alt='TeamShiksha Logo' />
				</section>
			</section>
		</footer>
	);
};

export default Footer;
