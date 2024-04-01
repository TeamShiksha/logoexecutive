import {useState} from 'react';
import {faqsData} from '../../constants';
import Accordion from '../common/accordion/Accordion';
import './FAQs.css';

const FAQs = () => {
	const [activeAccordian, setActiveAccordion] = useState(false);
	function handleChange(accordion) {
		setActiveAccordion(activeAccordian === accordion ? false : accordion);
	}

	return (
		<section className='faqs'>
			<h2 className='faqs-heading'>Frequently Asked Questions</h2>
			<div className='faqs-items-container'>
				{faqsData.map((faq) => {
					return (
						<Accordion
							key={faq.title}
							expanded={activeAccordian === faq.title}
							title={faq.title}
							toggle={handleChange}
						>
							<ul className='faq-steps'>
								{faq.steps.map((step, index) => {
									return <li key={index}>{step}</li>;
								})}
							</ul>
						</Accordion>
					);
				})}
			</div>
		</section>
	);
};

export default FAQs;
