import PropTypes from 'prop-types';
import './CustomInput.css';

function CustomInput({
	type,
	label,
	value,
	name,
	onChange,
	error,
	className,
	...rest
}) {
	return (
		<div className='custom-input-group'>
			<input
				type={type}
				id={label}
				name={name}
				value={value}
				onChange={onChange}
				required
				className={`custom-input ${className}`}
				{...rest}
			/>
			<label className='custom-input-label' htmlFor={label}>
				{label}
			</label>
			{error && <p className='custom-input-error'>{error}</p>}
		</div>
	);
}

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
