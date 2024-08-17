import { useEffect, useState } from 'react';
// import AddAdminForm from '../../components/admindashboard/AddAdminForm';
// import AdminTable from '../../components/admindashboard/AdminTable';
import DragAndDrop from '../../components/admindashboard/DragAndDrop';
import ImageTable from '../../components/admindashboard/ImageTable';
// import Divider from '../../components/common/divider/Divider';
// import {
// 	dummyAdminTableDetails,
// } from '../../constants';
import './Admin.css';
import { useApi } from '../../hooks/useApi';
import Cookies from 'js-cookie';

function AdminDashboard() {
	const [refreshImages, setRefreshImages] = useState(false);
	// const [adminDetails, setAdminDetails] = useState(dummyAdminTableDetails);
	const { data, makeRequest, errorMsg } = useApi({
		url: 'api/admin/images',
		method: 'get',
	});

	const userId = Cookies.get('userId');
	// Function to trigger refresh
	useEffect(() => {
		makeRequest();
	}, [refreshImages]);

	// function handleDeleteAdmin(adminEmail) {
	// 	setAdminDetails(adminDetails.filter((admin) => admin.email !== adminEmail));
	// }
	const handleImageUpload = () => {
		setRefreshImages(!refreshImages);
	};
	return (
		<div className='admin-container'>
			<section className='admin-section-container'>
				<h2>Add Image</h2>
				<DragAndDrop fetchUploadedImages={handleImageUpload} />
				<ImageTable userId={userId} errorMessage={errorMsg} refresh={refreshImages} />
			</section>
			{/* <Divider />
			<section className='admin-section-container'>
				<h2>Add Admin</h2>
				<AddAdminForm setAdminDetails={setAdminDetails} />
				<AdminTable
					adminDetails={adminDetails}
					deleteAdmin={handleDeleteAdmin}
				/>
			</section> */}
		</div>
	);
}

export default AdminDashboard;
