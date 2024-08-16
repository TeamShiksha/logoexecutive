import {IoMdClose} from 'react-icons/io';
import PropTypes from 'prop-types';
import {FaCopy} from 'react-icons/fa';

function ApiKey({Key, handleCloseKey, handleCopyToClipboard}) {
	return (
		<div className='api-key-container-main'>
			<div className='api-key-header'>
				<p className='api-key-warning'>
					Make sure to copy your API KEY now. You won’t be able to see it again!
				</p>

				<button
					className='api-key-buttons close-btn-ak'
					onClick={() => handleCloseKey()}
					aria-label='Close'
				>
					<IoMdClose />
				</button>
			</div>
			<div className='api-key-div '>
				<p>*******************</p>
				<div className='api-key-buttons-div'>
					<button
						className='api-key-buttons'
						onClick={() => handleCopyToClipboard(Key)}
						aria-label='Copy API Key'
					>
						<FaCopy />
					</button>
				</div>
			</div>
		</div>
	);
}
ApiKey.propTypes = {
	Key: PropTypes.string.isRequired,
	handleCloseKey: PropTypes.func.isRequired,
	handleCopyToClipboard: PropTypes.func.isRequired,
};

export default ApiKey;
