import PropTypes from 'prop-types';
import {BsArrowRepeat} from 'react-icons/bs';
import {imageTableHeadings} from '../../constants';
import {formatDate} from '../../utils/helpers';
import './ImageTable.css';
import {useState} from 'react';

function ImageTable({uploadedImages, errorMessage}) {
	const [currentPage, setCurrentPage] = useState(1);
	const [inputPage, setInputPage] = useState(1);
	const imagesPerPage = 20;

	const formattedUploadedImagesData = uploadedImages?.map((image) => ({
		...image,
		createdAt: formatDate(image.createdAt),
		updatedAt: formatDate(image.updatedAt),
	}));

	const indexOfLastImage = currentPage * imagesPerPage;
	const indexOfFirstImage = indexOfLastImage - imagesPerPage;
	const currentImages = formattedUploadedImagesData?.slice(
		indexOfFirstImage,
		indexOfLastImage,
	);

	const totalPages = Math.ceil(
		formattedUploadedImagesData?.length / imagesPerPage,
	);

	const handleNextPage = () => {
		if (currentPage < totalPages) {
			setCurrentPage(currentPage + 1);
			setInputPage(currentPage + 1);
		}
	};

	const handlePrevPage = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
			setInputPage(currentPage - 1);
		}
	};

	const handlePageInputChange = (e) => {
		const value = e.target.value;
		if (value === '' || (Number(value) && Number(value) > 0)) {
			setInputPage(value);
		}
	};

	const handlePageInputBlur = () => {
		const page = Number(inputPage);
		if (page >= 1 && page <= totalPages) {
			setCurrentPage(page);
		} else {
			setInputPage(currentPage);
		}
	};

	const handlePageInputKeyPress = (e) => {
		if (e.key === 'Enter') {
			handlePageInputBlur();
		}
	};

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
					{currentImages?.length > 0 ? (
						currentImages.map((image) => (
							<tr key={image.imageId}>
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
							<td colSpan='4' className={errorMessage ? 'error' : null}>
								{errorMessage
									? `Error : ${errorMessage}`
									: 'Your uploaded images will be visible here, drag and drop or click to upload.'}
							</td>
						</tr>
					)}
				</tbody>
			</table>
			{formattedUploadedImagesData?.length > imagesPerPage && (
				<div className='pagination'>
					<button
						className='pagination-button'
						onClick={handlePrevPage}
						disabled={currentPage === 1}
					>
						Previous
					</button>
					<span>
						Page{' '}
						<input
							type='text'
							value={inputPage}
							onChange={handlePageInputChange}
							onBlur={handlePageInputBlur}
							onKeyPress={handlePageInputKeyPress}
							className='pagination-input'
						/>{' '}
						of {totalPages}
					</span>
					<button
						className='pagination-button'
						onClick={handleNextPage}
						disabled={currentPage === totalPages}
					>
						Next
					</button>
				</div>
			)}
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
	errorMessage: PropTypes.string,
};

export default ImageTable;
