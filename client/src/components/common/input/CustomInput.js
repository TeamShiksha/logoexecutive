import PropTypes from 'prop-types';
import './CustomInput.css';

const CustomInput = ({
	type = 'text',
	label,
	value,
	name,
	onChange,
	error,
	className,
	...props
}) => {
	return (
		<div className='custom-input-group'>
			<input
				type={type}
				id={props.id}
				name={name}
				value={value}
				onChange={onChange}
				required
				className={`custom-input ${className}`}
				{...props}
			/>
			<label className='custom-input-label' htmlFor={props.id}>
				{label}
			</label>
			{error && <p className='custom-input-error'>{error}</p>}
		</div>
	);
};

CustomInput.propTypes = {
	type: PropTypes.string.isRequired,
	label: PropTypes.string.isRequired,
	value: PropTypes.string.isRequired,
	name: PropTypes.string.isRequired,
	onChange: PropTypes.func.isRequired,
	error: PropTypes.string,
	className: PropTypes.string,
};

export default CustomInput;
