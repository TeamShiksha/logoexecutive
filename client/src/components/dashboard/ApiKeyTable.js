import PropTypes from 'prop-types';
import { MdDeleteOutline } from 'react-icons/md';
import { formatDate } from '../../utils/helpers';
import Modal from '../common/modal/Modal';
import { useRef, useState } from 'react';
function ApiKeyTable({ keys, deleteKey, handleCloseKey }) {
  const apiKeyToBeDeleted = useRef(null);
  const [modalOpen, setModalOpen] = useState(false);

  const showConfirmationModal = (keyId) => {
    apiKeyToBeDeleted.current = keyId;
    setModalOpen(true);
  };

  const confirmActionHandler = () => {
    setModalOpen(false);
    deleteKey(apiKeyToBeDeleted.current);
    apiKeyToBeDeleted.current = null;
    handleCloseKey();
  };

  return (
    <section className='dashboard-content-section'>
      <div className='dashboard-content-item api-key-table'>
        <table>
          <thead>
            <tr>
              <th>DESCRIPTION</th>
              <th>ACTION</th>
              <th>CREATE DATE</th>
            </tr>
          </thead>
          <tbody>
            {!keys.length && (
              <tr>
                <td colSpan='3' className='no-keys'>
                  Your api keys will be visible here, click on generate key to
                  add new api key
                </td>
              </tr>
            )}
            {keys.map((key, index) => (
              <tr key={index}>
                <td>{key.keyDescription}</td>
                <td>
                  <button
                    className='api-key-delete-button'
                    data-testid='api-key-delete'
                    onClick={() => showConfirmationModal(key.keyId)}
                  >
                    <MdDeleteOutline />
                  </button>
                </td>
                <td>{formatDate(key?.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal
        modalOpen={modalOpen}
        setModal={setModalOpen}
        showButtons={true}
        handleConfirm={confirmActionHandler}
      >
        <h2>Are you sure?</h2>
        <p className='settings-confirm-message'>
          Please confirm that you want to delete this permanently, as this
          action cannot be undone.
        </p>
      </Modal>
    </section>
  );
}

ApiKeyTable.propTypes = {
  keys: PropTypes.arrayOf(
    PropTypes.shape({
      description: PropTypes.string,
      apiKey: PropTypes.string,
    }),
  ).isRequired,
  deleteKey: PropTypes.func.isRequired,
  handleCloseKey: PropTypes.func.isRequired,
};

export default ApiKeyTable;
