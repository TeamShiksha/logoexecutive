import {getClassnames} from '../../utils/styleUtils';
import './Spinner.css';

export const SPINNER_SIZE = {
	SMALL: 'SMALL', // spinner of thickness 20px
	MEDIUM: 'MEDIUM', // spinner of thickness 40px
	LARGE: 'LARGE', // spinner of thickness 50px
};

/**
 * @description - component to render a spinner
 * @returns {JSX.Element}
 */
export const Spinner = ({size = SPINNER_SIZE.MEDIUM}) => {
	const spinnerClasses = getClassnames({
		spinner: true,
		small: size === SPINNER_SIZE.SMALL,
		medium: size === SPINNER_SIZE.MEDIUM,
		large: size === SPINNER_SIZE.LARGE,
	});

	return (
		<div className='spinner_container'>
			<div className={spinnerClasses} />
		</div>
	);
};
