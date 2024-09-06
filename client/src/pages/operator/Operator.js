import React, {useEffect, useState} from 'react';
import axios from 'axios'; // Import Axios
import Modal from '../../components/common/modal/Modal';
import './Operator.css';
import Card from './Card';
import Spinner from '../../components/spinner/Spinner';

function Operator() {
	const [selectedQuery, setSelectedQuery] = useState(null);
	const [modalOpen, setModalOpen] = useState(false);
	const [activeTab, setActiveTab] = useState('ACTIVE');
	const [response, setResponse] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [inputPage, setInputPage] = useState(1);
	const [queries, setQueries] = useState([]);
	const queriesPerPage = 5; // Number of queries per page

	const truncateText = (text, maxLength) => {
		if (text.length > maxLength) {
			return text.substring(0, maxLength) + '...';
		}
		return text;
	};

	const handleButtonClick = (query) => {
		setSelectedQuery(query);
		setModalOpen(true);
	};

	const handleModalClose = () => {
		setModalOpen(false);
		setSelectedQuery(null);
		setResponse('');
		setError('');
	};

	const handleResponseChange = (event) => {
		setResponse(event.target.value);
	};

	const handleGetQueries = async () => {
		setLoading(true);
		setError('');

		try {
			const params = {
				model: 'ContactUs',
				page: currentPage,
				limit: queriesPerPage,
				active: activeTab !== 'ACTIVE',
			};

			const {data} = await axios.get('api/common/pagination', {
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
				params,
			});

			setQueries(data.results);
		} catch (err) {
			setError(
				err.response?.data?.message ||
					'Failed to send response. Please try again.',
			);
		} finally {
			setLoading(false);
		}
	};

	const handleSendResponse = async () => {
		if (!selectedQuery) return;

		setLoading(true);
		setError('');

		try {
			const responsePayload = {
				id: selectedQuery._id,
				email: selectedQuery.email,
				reply: response,
			};

			const {data} = await axios.put('api/operator/revert', responsePayload, {
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
			});

			alert(data.message);
			handleModalClose();
		} catch (err) {
			setError(
				err.response?.data?.message ||
					'Failed to send response. Please try again.',
			);
		} finally {
			setLoading(false);
		}
	};

	const handleTabChange = (tab) => {
		setActiveTab(tab);
		setCurrentPage(1); // Reset to the first page when switching tabs
		setInputPage(1); // Reset input page when switching tabs
	};

	// Filter queries based on the active tab
	// const activeQueries = queries.filter((query) => !query.activityStatus);
	// const archivedQueries = queries.filter((query) => query.activityStatus);

	// Get the queries for the current page
	// const indexOfLastQuery = currentPage * queriesPerPage;
	// const indexOfFirstQuery = indexOfLastQuery - queriesPerPage;
	// const currentQueries =
	// 	activeTab === 'ACTIVE'
	// 		? activeQueries.slice(indexOfFirstQuery, indexOfLastQuery)
	// 		: archivedQueries.slice(indexOfFirstQuery, indexOfLastQuery);

	// // Pagination controls
	// const totalPages = Math.ceil(
	// 	(activeTab === 'ACTIVE' ? activeQueries.length : archivedQueries.length) /
	// 		queriesPerPage,
	// );

	const handleNextPage = () => {
		// if (currentPage < totalPages) {
		// 	setCurrentPage(currentPage + 1);
		// 	setInputPage(currentPage + 1);
		// }
	};

	const handlePrevPage = () => {
		// if (currentPage > 1) {
		// 	setCurrentPage(currentPage - 1);
		// 	setInputPage(currentPage - 1);
		// }
	};

	const handlePageInputChange = (e) => {
		// const value = e.target.value;
		// if (value === '' || (Number(value) && Number(value) > 0)) {
		// 	setInputPage(value);
		// }
	};

	const handlePageInputBlur = () => {
		// const page = Number(inputPage);
		// if (page >= 1 && page <= totalPages) {
		// 	setCurrentPage(page);
		// } else {
		// 	setInputPage(currentPage);
		// }
	};

	const handlePageInputKeyPress = (e) => {
		// if (e.key === 'Enter') {
		// 	handlePageInputBlur();
		// }
	};

	useEffect(() => {
		handleGetQueries();
	}, [activeTab]);

	return (
		<div data-testid="testid-operator" className='operator-container'>
			{loading && <Spinner />}
			<div data-testid="tabs-container" className='tabs'>
				<button
					className={`tab ${activeTab === 'ACTIVE' ? 'active' : ''}`}
					onClick={() => handleTabChange('ACTIVE')}
				>
					ACTIVE
				</button>
				<button
					className={`tab ${activeTab === 'ARCHIVED' ? 'active' : ''}`}
					onClick={() => handleTabChange('ARCHIVED')}
				>
					ARCHIVED
				</button>
			</div>
			<div data-testid="tab-content-container" className='tab-content'>
				{queries.length === 0 ? (
					<p>No queries available.</p>
				) : (
					queries.map((query, index) => (
						<Card key={index} className='query-card'>
							<p>
								<strong>Message:</strong> {truncateText(query.message, 100)}
							</p>
							<div className='card-footer'>
								<span className='created-at'>
									{new Date(query.createdAt).toLocaleDateString()}
								</span>
							</div>
							<button
								className='view-response-button'
								onClick={() => handleButtonClick(query)}
							>
								Respond
							</button>
						</Card>
					))
				)}
			</div>

			{/* Pagination Controls */}
			{activeTab === 'ACTIVE' && queries.length > queriesPerPage && (
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
						{/* of {totalPages} */}
					</span>
					<button
						className='pagination-button'
						onClick={handleNextPage}
						// disabled={currentPage === totalPages}
					>
						Next
					</button>
				</div>
			)}
			{activeTab === 'ARCHIVED' && queries.length > queriesPerPage && (
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
						{/* of {totalPages} */}
					</span>
					<button
						className='pagination-button'
						onClick={handleNextPage}
						// disabled={currentPage === totalPages}
					>
						Next
					</button>
				</div>
			)}

			{/* Modal for detailed query */}
			<Modal
				modalOpen={modalOpen}
				setModal={setModalOpen}
				showButtons={false}
				onClose={handleModalClose}
			>
				{selectedQuery && (
					<div className='query-details'>
						<h2>Respond to Customer</h2>
						<p>
							<strong>Inquiry:</strong> {selectedQuery.message}
						</p>

						<textarea
							className='response-textarea'
							value={response}
							onChange={handleResponseChange}
							placeholder='Write your response here...'
						/>
						{error && <p className='error-message'>*{error}</p>}
						<button
							className='send-response-button'
							onClick={handleSendResponse}
							disabled={loading} // Disable button while loading
						>
							{loading ? 'Sending...' : 'Send'}
						</button>
					</div>
				)}
			</Modal>
		</div>
	);
}

export default Operator;
