import React, {useContext, useEffect, useState} from 'react';
import axios from 'axios';
import Modal from '../../components/common/modal/Modal';
import './Operator.css';
import Card from './Card';
import Spinner from '../../components/spinner/Spinner';
import {OperatorContext} from '../../contexts/OperatorContext';

function Operator() {
	const [selectedQuery, setSelectedQuery] = useState(null);
	const [modalOpen, setModalOpen] = useState(false);
	const [activeTab, setActiveTab] = useState('ACTIVE');
	const [response, setResponse] = useState('');
	const [load, setLoad] = useState(false);
	const [errorMsg, setErrorMsg] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [inputPage, setInputPage] = useState(1);
	const {queries, loading, fetchQueries} = useContext(OperatorContext);
	const queriesPerPage = 5;

	const handleButtonClick = (query) => {
		setSelectedQuery(query);
		setModalOpen(true);
	};

	const handleModalClose = () => {
		setModalOpen(false);
		setSelectedQuery(null);
		setResponse('');
		setErrorMsg('');
	};

	const handleResponseChange = (event) => {
		setResponse(event.target.value);
	};

	const handleSendResponse = async () => {
		if (!selectedQuery) return;

		setLoad(true);
		setErrorMsg('');

		try {
			const responsePayload = {
				id: selectedQuery._id,
				reply: response,
			};

			await axios.put('api/operator/revert', responsePayload, {
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
			});

			setActiveTab('ARCHIVED');
			handleModalClose();
		} catch (err) {
			setErrorMsg(
				err.response?.data?.message ||
					'Failed to send response. Please try again.',
			);
		} finally {
			setLoad(false);
		}
	};

	const handleTabChange = (tab) => {
		setActiveTab(tab);
		setCurrentPage(1);
		setInputPage(1);
	};

	const handleNextPage = () => {
		if (currentPage < queries?.pages) {
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

	useEffect(() => {
		fetchQueries(activeTab !== 'ACTIVE', inputPage, queriesPerPage);
	}, [activeTab, inputPage]);

	return (
		<div data-testid='testid-operator' className='operator-container'>
			{loading && <Spinner />}
			<div data-testid='tabs-container' className='tabs'>
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
			<div data-testid='tab-content-container' className='tab-content'>
				{queries?.results?.length === 0 ? (
					<p className='no-queries'>No queries available.</p>
				) : (
					queries?.results?.map((query, index) => (
						<Card key={index} className='query-card'>
							<p>
								<strong>Message:</strong> {query.message}
							</p>
							<div>
								<p className='card-footer'>
									{new Date(query.createdAt).toDateString()}
								</p>
								{activeTab !== 'ARCHIVED' && (
									<button
										className='view-response-button'
										onClick={() => handleButtonClick(query)}
									>
										Respond
									</button>
								)}
							</div>
						</Card>
					))
				)}
			</div>

			<div className='pagination'>
				<button
					className='pagination-button'
					onClick={handlePrevPage}
					disabled={currentPage === 1}
				>
					&#8592;
				</button>
				<button
					className='pagination-button'
					onClick={handleNextPage}
					disabled={currentPage === queries?.pages}
				>
					&#8594;
				</button>
			</div>

			{/* Modal for detailed query */}
			<Modal
				modalOpen={modalOpen}
				setModal={setModalOpen}
				showButtons={false}
				onClose={handleModalClose}
				containerClassName='modal'
			>
				{selectedQuery && (
					<div className='query-details'>
						<h2>Respond to Customer</h2>
						<textarea
							className='response-textarea'
							value={response}
							onChange={handleResponseChange}
							placeholder='Write your response here...'
						/>
						{errorMsg && <p className='error-message'>{errorMsg}</p>}
						<button
							className='send-response-button'
							onClick={handleSendResponse}
							disabled={load} // Disable button while loading
						>
							{load ? 'Sending...' : 'Send'}
						</button>
					</div>
				)}
			</Modal>
		</div>
	);
}

export default Operator;
