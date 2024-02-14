import PropTypes from 'prop-types';
import CustomInput from '../common/input/CustomInput';

const ApiKeyForm = ({
	inputValue,
	setInputValue,
	errorMessage,
	setErrorMessage,
	handleGenerateKey,
}) => {
	return (
		<section className='dashboard-content-section'>
			<form className='api-key-container ' onSubmit={handleGenerateKey}>
				<CustomInput
					type='text'
					name='apikey'
					value={inputValue}
					label='Description for API Key'
					onChange={(e) => {
						setInputValue(e.target.value);
						setErrorMessage('');
					}}
					error={errorMessage}
				/>
				<button type='submit'>Generate Key</button>
			</form>
		</section>
	);
};

ApiKeyForm.propTypes = {
	inputValue: PropTypes.string.isRequired,
	setInputValue: PropTypes.func.isRequired,
	errorMessage: PropTypes.string,
	setErrorMessage: PropTypes.func.isRequired,
	handleGenerateKey: PropTypes.func.isRequired,
};

export default ApiKeyForm;
