import {useState} from 'react';
import DragAndDrop from '../../components/admindashboard/DragAndDrop';
import ImageTable from '../../components/admindashboard/ImageTable';
import {dummyUploadedImageDetails} from '../../constants';
import './Admin.css';

const AdminDashboard = () => {
	const [uploadedImages, setUploadedImages] = useState(
		dummyUploadedImageDetails,
	);
	return (
		<div className='admin-container'>
			<DragAndDrop setUploadedImages={setUploadedImages} />
			<ImageTable uploadedImages={uploadedImages} />
		</div>
	);
};

export default AdminDashboard;
