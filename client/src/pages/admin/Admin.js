import {useState} from 'react';
import AddAdminForm from '../../components/admindashboard/AddAdminForm';
import AdminTable from '../../components/admindashboard/AdminTable';
import DragAndDrop from '../../components/admindashboard/DragAndDrop';
import ImageTable from '../../components/admindashboard/ImageTable';
import Divider from '../../components/common/divider/Divider';
import {
	dummyAdminTableDetails,
	dummyUploadedImageDetails,
} from '../../constants';
import './Admin.css';

function AdminDashboard() {
	const [uploadedImages, setUploadedImages] = useState(
		dummyUploadedImageDetails,
	);
	const [adminDetails, setAdminDetails] = useState(dummyAdminTableDetails);
	function handleDeleteAdmin(adminEmail) {
		setAdminDetails(adminDetails.filter((admin) => admin.email !== adminEmail));
	}

	return (
		<div className='admin-container'>
			<section className='admin-section-container'>
				<h2>Add Image</h2>
				<DragAndDrop setUploadedImages={setUploadedImages} />
				<ImageTable uploadedImages={uploadedImages} />
			</section>
			<Divider />
			<section className='admin-section-container'>
				<h2>Add Admin</h2>
				<AddAdminForm setAdminDetails={setAdminDetails} />
				<AdminTable
					adminDetails={adminDetails}
					deleteAdmin={handleDeleteAdmin}
				/>
			</section>
		</div>
	);
}

export default AdminDashboard;
