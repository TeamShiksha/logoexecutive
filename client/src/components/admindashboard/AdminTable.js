import PropTypes from 'prop-types';
import {adminTableHeadings} from '../../constants';
import {MdDeleteOutline} from 'react-icons/md';
import './AdminTable.css';

function AdminTable({adminDetails, deleteAdmin}) {
	return (
		<div className='admin-table-wrapper'>
			<table className='admin-table'>
				<thead>
					<tr className='admin-table-heding-row'>
						{adminTableHeadings.map((heading, index) => (
							<th key={index}>{heading}</th>
						))}
					</tr>
				</thead>
				<tbody>
					{adminDetails.map((admin, index) => (
						<tr key={index}>
							<td>{admin.email}</td>
							<td>{admin.reason}</td>
							<td>
								<button
									className='action-btn'
									onClick={() => deleteAdmin(admin.email)}
								>
									<MdDeleteOutline />
								</button>
							</td>
							<td>{admin.createDate}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

AdminTable.propTypes = {
	adminDetails: PropTypes.arrayOf(
		PropTypes.shape({
			email: PropTypes.string.isRequired,
			reason: PropTypes.string.isRequired,
			createDate: PropTypes.string.isRequired,
		}),
	).isRequired,
	deleteAdmin: PropTypes.func,
};

export default AdminTable;
