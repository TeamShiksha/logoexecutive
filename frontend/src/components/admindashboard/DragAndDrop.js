import {useEffect, useRef, useState} from 'react';
import './DragAndDrop.css';

const DragAndDrop = () => {
	const [image, setImage] = useState(null);
	const [isDragging, setIsDragging] = useState(false);
	const [errorMessage, setErrorMessage] = useState(null);
	const fileInputRef = useRef(null);

	// Revoke the object URL whenever the image changes or the component unmounts to avoid memory leak.
	useEffect(() => {
		return () => {
			if (image?.url) {
				URL.revokeObjectURL(image.url);
			}
		};
	}, [image]);

	function handleFileSelection() {
		fileInputRef.current.click();
	}

	function onFileSelect(event) {
		setErrorMessage(null);
		setImage(null);

		const files = event.target.files;
		if (files.length === 0) return;

		const file = files[0];
		const fileType = file.type;
		const validImageTypes = ['image/jpeg', 'image/png'];

		if (!validImageTypes.includes(fileType)) {
			setErrorMessage(
				`Please select an image file. You chose a ${fileType} file.`,
			);
			return;
		}
		console.log(file);

		try {
			const url = URL.createObjectURL(file);
			setImage({name: file.name, url});
		} catch (error) {
			setErrorMessage('An error occurred while reading the file.');
		}
	}

	return (
		<section className='card'>
			<div className='drag-area' role='button' onClick={handleFileSelection}>
				{isDragging ? (
					<p>Yes, drop here</p>
				) : (
					<p className='select'>
						Drag and drop your image here or click to browse.
					</p>
				)}
				<input
					ref={fileInputRef}
					onChange={onFileSelect}
					name='file'
					type='file'
					className='file'
					accept='image/*'
				/>
			</div>
			{errorMessage && <p>{errorMessage}</p>}
			<div className='preview-container'>
				<div className='image-preview'>
					<span className='image-delete'>&times;</span>
				</div>
				{image && <img src={image.url} alt={image.name} />}
			</div>
			<button className='images-upload-btn'>Upload</button>
		</section>
	);
};

export default DragAndDrop;
