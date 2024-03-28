import PropTypes from 'prop-types';
import {MdOutlineExpandMore} from 'react-icons/md';
import './Accordion.css';

function Accordion({title, children, expanded, toggle}) {
	return (
		<div className='accordion'>
			<div className='accordion-header' onClick={() => toggle(title)}>
				<h3 className={'accordion-title'}>{title}</h3>
				<MdOutlineExpandMore
					className={`accordion-expand-icon ${expanded ? 'expanded' : ''}`}
				/>
			</div>
			<div
				className={`accordion-content ${expanded ? 'show' : ''}`}
				data-testid='accordion-content-wrapper'
			>
				<div className='accordion-child-wrapper'>{children}</div>
			</div>
		</div>
	);
}

Accordion.propTypes = {
	children: PropTypes.node.isRequired,
	expanded: PropTypes.bool.isRequired,
	toggle: PropTypes.func.isRequired,
	title: PropTypes.string.isRequired,
};

export default Accordion;
