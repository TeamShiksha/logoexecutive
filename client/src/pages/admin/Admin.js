import {useEffect} from 'react';
// import AddAdminForm from '../../components/admindashboard/AddAdminForm';
// import AdminTable from '../../components/admindashboard/AdminTable';
import DragAndDrop from '../../components/admindashboard/DragAndDrop';
import ImageTable from '../../components/admindashboard/ImageTable';
// import Divider from '../../components/common/divider/Divider';
// import {
// 	dummyAdminTableDetails,
// } from '../../constants';
import './Admin.css';
import {useApi} from '../../hooks/useApi';

function AdminDashboard() {
	// const [adminDetails, setAdminDetails] = useState(dummyAdminTableDetails);
	const {data, makeRequest, errorMsg} = useApi(
		{
			url: 'api/admin/images',
			method: 'get',
		},
		true,
	);

	useEffect(() => {
		makeRequest();
	}, []);

	// function handleDeleteAdmin(adminEmail) {
	// 	setAdminDetails(adminDetails.filter((admin) => admin.email !== adminEmail));
	// }

	return (
		<div className='admin-container'>
			<section className='admin-section-container'>
				<h2>Add Image</h2>
				<DragAndDrop fetchUploadedImages={makeRequest} />
				<ImageTable uploadedImages={data?.data} errorMessage={errorMsg} />
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
