import {useState} from 'react';
import './ImageTable.css';

const imageTableHeadings = [
	'IMAGE NAME',
	'CREATE DATE',
	'UPDATE DATE',
	'REUPLOAD',
];

const ImageTable = () => {
	const [uploadedImagesDetails, setUploadedImagesDetails] = useState([
		{
			name: 'TeamShiksha.png',
			createDate: 'Dec 18, 2023',
			updateDate: 'Dec 27, 2023',
		},
		{
			name: 'LogoExecutive.jpg',
			createDate: 'Sep 07, 2023',
			updateDate: 'Oct 12, 2023',
		},
	]);

	return (
		<table className='image-table'>
			<thead>
				<tr>
					{imageTableHeadings.map((heading, index) => (
						<th key={index}>{heading}</th>
					))}
				</tr>
			</thead>
			<tbody>
				{uploadedImagesDetails.map((imageDetails, index) => (
					<tr key={index}>
						<td>{imageDetails.name}</td>
						<td>{imageDetails.createDate}</td>
						<td>{imageDetails.updateDate}</td>
						<td></td>
					</tr>
				))}
			</tbody>
		</table>
	);
};

export default ImageTable;
