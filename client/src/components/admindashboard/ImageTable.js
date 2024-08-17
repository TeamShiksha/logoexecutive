import PropTypes from 'prop-types';
import { BsArrowRepeat } from 'react-icons/bs';
import { imageTableHeadings } from '../../constants';
import { formatDate } from '../../utils/helpers';
import './ImageTable.css';
import { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';

function ImageTable({ userId, errorMessage, refresh }) {
	const [uploadedImages, setUploadedImages] = useState([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [inputPage, setInputPage] = useState(1);
	const [loading, setLoading] = useState(false);
	const [totalPages, setTotalPages] = useState(0);
	const [totalCount, setTotalCount] = useState(0);
	const imagesPerPage = 20;

	useEffect(() => {
		const fetchImages = async () => {
			setLoading(true);
			try {
				const response = await fetch(
					`/api/admin/images/query?userId=${userId}&page=${currentPage}&limit=${imagesPerPage}`,
				);
				const data = await response.json();
				if (response.ok) {
					setUploadedImages(data.data || []);
					const count = data.totalCount || 0;
					setTotalCount(count);
					setTotalPages(Math.ceil(count / imagesPerPage));
					setInputPage(currentPage);
				} else {
					console.error(data.message || 'Failed to fetch images');
					setUploadedImages([]);
					setTotalPages(0);
					setTotalCount(0);
				}
			} catch (error) {
				console.error('Error fetching images:', error);
				setUploadedImages([]);
				setTotalPages(0);
				setTotalCount(0);
			} finally {
				setLoading(false);
			}
		};

		fetchImages();
	}, [currentPage, userId, refresh]);

	const handleNextPage = () => {
		if (currentPage < totalPages) {
			setCurrentPage(currentPage + 1);
		}
	};

	const handlePrevPage = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
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

	const formattedUploadedImagesData = uploadedImages.map((image) => ({
		...image,
		userId,
		createdAt: formatDate(image.createdAt),
		updatedAt: formatDate(image.updatedAt),
	}));

	return (
		<div className='image-table-wrapper'>
			<table className='image-table'>
				<thead>
					<tr className='image-table-heading-row'>
						{imageTableHeadings.map((heading, index) => (
							<th key={index}>{heading}</th>
						))}
					</tr>
				</thead>
				<tbody>
					{loading ? (
						<tr>
							<td colSpan='4'>Loading...</td>
						</tr>
					) : formattedUploadedImagesData.length > 0 ? (
						formattedUploadedImagesData.map((image, index) => (
							<tr key={index}>
								<td>{
									image.domainame.length < 12 ? image.domainame : image.domainame.substring(0, 12) + '...'
								}</td>
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
			{totalPages > 1 && (
				<div className='pagination'>
					<button
						className='pagination-button'
						onClick={handlePrevPage}
						disabled={currentPage === 1 || loading}
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
						disabled={currentPage === totalPages || loading}
					>
						Next
					</button>
				</div>
			)}
		</div>
	);
}

ImageTable.propTypes = {
	userId: PropTypes.string.isRequired,
	errorMessage: PropTypes.string,
	refresh: PropTypes.bool,
};

export default ImageTable;
