import { IoMdClose } from 'react-icons/io';
import PropTypes from 'prop-types';
import { FaCopy, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useState } from 'react';

function ApiKey({ Key, handleCloseKey, handleCopyToClipboard }) {
  const [hideKey, setHideKey] = useState(true);
  return (
    <div className='dashboard-content-item'>
      <div className='current-plan-header'>
        <p className='api-key-warning'>
          Make sure to copy your API KEY now. You won’t be able to see it again!
        </p>

        <button className='api-key-buttons' onClick={() => handleCloseKey()}>
          <IoMdClose />
        </button>
      </div>
      <div className='api-key-div dashboard-content-item'>
        <p>{hideKey ? '*******************' : Key}</p>
        <div className='api-key-buttons-div'>
          <button
            className='api-key-buttons'
            onClick={() => setHideKey(!hideKey)}
          >
            {hideKey ? <FaEye /> : <FaEyeSlash />}{' '}
            {/* Replace with appropriate icons */}
          </button>
          <button
            className='api-key-buttons'
            onClick={() => handleCopyToClipboard(Key)}
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
