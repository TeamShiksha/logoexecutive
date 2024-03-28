import './Spinner.css';

/**
 * @description - component to render a spinner
 * @returns {JSX.Element}
 */
function Spinner() {
	return (
		<div className='container' data-testid='spinner-container'>
			<div className='spinner' data-testid='spinner' />
		</div>
	);
}

export default Spinner;
