import PropTypes from 'prop-types';
import {FiCopy} from 'react-icons/fi';
import {LuCopyCheck} from 'react-icons/lu';
import {MdDeleteOutline} from 'react-icons/md';
import {formatDate} from '../../utils/helpers';
import Modal from '../common/modal/Modal';
import {useRef, useState} from 'react';
function ApiKeyTable({keys, copiedKey, handleCopyToClipboard, deleteKey}) {
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
	};

	return (
		<section className='dashboard-content-section'>
			<div className='dashboard-content-item api-key-table'>
				<table>
					<thead>
						<tr>
							<th>DESCRIPTION</th>
							<th>API KEY</th>
							<th>ACTION</th>
							<th>CREATE DATE</th>
						</tr>
					</thead>
					<tbody>
						{!keys.length && (
							<tr>
								<td colSpan='4' className='no-keys'>
									Your api keys will be visible here, click on generate key to
									add new api key
								</td>
							</tr>
						)}
						{keys.map((key, index) => (
							<tr key={index}>
								<td>{key.keyDescription}</td>
								<td className='api-key-column'>
									{copiedKey === key.key ? (
										<div
											className='api-key-copied'
											data-testid='api-key-copied'
										>
											<LuCopyCheck />
										</div>
									) : (
										<button
											className='api-key-copy'
											data-testid='api-key-copy'
											onClick={() => handleCopyToClipboard(key.key)}
										>
											<FiCopy />
										</button>
									)}
								</td>
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
	copiedKey: PropTypes.string,
	handleCopyToClipboard: PropTypes.func.isRequired,
	deleteKey: PropTypes.func.isRequired,
};

export default ApiKeyTable;
