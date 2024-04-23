import PropTypes from 'prop-types';
import CustomInput from '../common/input/CustomInput';

function ApiKeyForm({
	inputValue,
	setInputValue,
	errorMessage,
	setErrorMessage,
	handleGenerateKey,
	loading,
}) {
	return (
		<section className='dashboard-content-section'>
			<form
				className='api-key-container '
				onSubmit={handleGenerateKey}
				noValidate
			>
				{errorMessage && <p className='custom-input-error'>{errorMessage}</p>}
				<CustomInput
					type='text'
					name='apikey'
					value={inputValue}
					disabled={loading}
					label='Description For API Key'
					onChange={(e) => {
						setInputValue(e.target.value);
						setErrorMessage('');
					}}
				/>
				<button type='submit' disabled={loading}>
					Generate Key
				</button>
			</form>
		</section>
	);
}

ApiKeyForm.propTypes = {
	inputValue: PropTypes.string.isRequired,
	setInputValue: PropTypes.func.isRequired,
	errorMessage: PropTypes.string,
	setErrorMessage: PropTypes.func.isRequired,
	handleGenerateKey: PropTypes.func.isRequired,
};

export default ApiKeyForm;
