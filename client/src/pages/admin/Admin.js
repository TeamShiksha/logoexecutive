import {useState} from 'react';
import DragAndDrop from '../../components/admindashboard/DragAndDrop';
import ImageTable from '../../components/admindashboard/ImageTable';
import {dummyUploadedImageDetails} from '../../constants';
import './Admin.css';
import Divider from '../../components/common/divider/Divider';

const AdminDashboard = () => {
	const [uploadedImages, setUploadedImages] = useState(
		dummyUploadedImageDetails,
	);
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
			</section>
		</div>
	);
};

export default AdminDashboard;
