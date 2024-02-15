import PropTypes from 'prop-types';
import {BsArrowRepeat} from 'react-icons/bs';
import {imageTableHeadings} from '../../constants';
import './ImageTable.css';

const ImageTable = ({uploadedImages}) => {
	return (
		<div className='image-table-wrapper'>
			<table className='image-table'>
				<thead>
					<tr className='image-table-heding-row'>
						{imageTableHeadings.map((heading, index) => (
							<th key={index}>{heading}</th>
						))}
					</tr>
				</thead>
				<tbody>
					{uploadedImages.map((image, index) => (
						<tr key={index}>
							<td>{image.name}</td>
							<td>{image.createDate}</td>
							<td>{image.updateDate}</td>
							<td>
								<button className='reupload-btn'>
									<BsArrowRepeat />
								</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

ImageTable.propTypes = {
	uploadedImages: PropTypes.arrayOf(
		PropTypes.shape({
			name: PropTypes.string.isRequired,
			createDate: PropTypes.string.isRequired,
			updateDate: PropTypes.string.isRequired,
		}),
	).isRequired,
};

export default ImageTable;
