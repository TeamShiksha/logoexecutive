import PropTypes from 'prop-types';
import {FiCopy} from 'react-icons/fi';
import {LuCopyCheck} from 'react-icons/lu';
import {MdDeleteOutline} from 'react-icons/md';
import {formatDate} from '../../utils/helpers';

function ApiKeyTable({keys, copiedKey, handleCopyToClipboard, deleteKey}) {
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
										onClick={() => deleteKey(key.keyId)}
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
