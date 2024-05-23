import PropTypes from 'prop-types';
import {BsArrowRepeat} from 'react-icons/bs';
import {imageTableHeadings} from '../../constants';
import {formatDate} from '../../utils/helpers';
import './ImageTable.css';

function ImageTable({uploadedImages}) {
	const formattedUploadedImagesData = uploadedImages?.map((image) => ({
		...image,
		createdAt: formatDate(image.createdAt),
		updatedAt: formatDate(image.updatedAt),
	}));

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
					{formattedUploadedImagesData?.length > 0 ? (
						formattedUploadedImagesData.map((image, index) => (
							<tr key={index}>
								<td>{image.domainame}</td>
								<td>{image.createdAt}</td>
								<td>{image.updatedAt}</td>
								<td>
									<button disabled className='reupload-btn'>
										<BsArrowRepeat />
									</button>
								</td>
							</tr>
						))
					) : (
						<tr>
							<td colSpan='4' className='no-keys'>
								Your uploaded images will be visible here, drag and drop or
								click to upload.
							</td>
						</tr>
					)}
				</tbody>
			</table>
		</div>
	);
}

ImageTable.propTypes = {
	uploadedImages: PropTypes.arrayOf(
		PropTypes.shape({
			domainame: PropTypes.string.isRequired,
			createdAt: PropTypes.string.isRequired,
			updatedAt: PropTypes.string.isRequired,
		}),
	),
};

export default ImageTable;
