import PropTypes from 'prop-types';
import {useEffect, useRef, useState} from 'react';
import useFileHandler from '../../hooks/useFileHandler';
import PreviewModal from './PreviewModal';
import './DragAndDrop.css';

function DragAndDrop({fetchUploadedImages}) {
	const validImageFormats = ['jpg', 'png', 'svg'];
	const [isDragging, setIsDragging] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const fileInputRef = useRef(null);
	const {
		file: image,
		setFile: setImage,
		error: errorMessage,
		handleFile,
	} = useFileHandler(validImageFormats);

	useEffect(() => {
		if (image) setIsModalOpen(true);
		return () => {
			if (image?.url) {
				URL.revokeObjectURL(image.url);
			}
		};
	}, [image]);

	function resetModal(modalStatus) {
		setIsModalOpen(modalStatus);
		setImage(null);
	}

	function handleFileSelection() {
		fileInputRef.current.click();
	}
	function onFileSelect(event) {
		const files = event.target.files;
		if (files.length === 0) return;
		const file = files[0];
		handleFile(file);
	}
	function handleImageNameChange(event) {
		setImage((prev) => {
			return {...prev, name: event.target.value};
		});
	}
	function handleDragLeave(event) {
		event.preventDefault();
		setIsDragging(false);
	}
	function handleDragOver(event) {
		event.preventDefault();
		setIsDragging(true);
		event.dataTransfer.dropEffect = 'copy';
	}
	function handleOnDrop(event) {
		event.preventDefault();
		setIsDragging(false);
		const files = event.dataTransfer.files;
		if (files.length === 0) return;
		const file = files[0];
		handleFile(file);
	}

	return (
		<section className='drag-drop-section' data-testid='component'>
			<div
				className='drag-area'
				data-testid='drag-area'
				role='button'
				onClick={handleFileSelection}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleOnDrop}
			>
				{isDragging ? (
					<p>Yes, drop here</p>
				) : (
					<p className='select'>
						Drag and drop your image here or click to browse.
					</p>
				)}
				<input
					ref={fileInputRef}
					key={Math.random()}
					onChange={onFileSelect}
					name='file'
					type='file'
					className='file'
					data-testid='file-upload'
					accept='image/jpeg, image/png, image/svg+xml'
				/>
			</div>
			{errorMessage && (
				<p className='image-select-error' data-testid='image-error'>
					{errorMessage}
				</p>
			)}
			{image && (
				<PreviewModal
					data-testid='preview'
					image={image}
					handleImageNameChange={handleImageNameChange}
					isModalOpen={isModalOpen}
					setIsModalOpen={resetModal}
					fetchUploadedImages={fetchUploadedImages}
				/>
			)}
		</section>
	);
}

DragAndDrop.propTypes = {
	fetchUploadedImages: PropTypes.func.isRequired,
};

export default DragAndDrop;
