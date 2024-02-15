import PropTypes from 'prop-types';
import CustomInput from '../common/input/CustomInput';
import Modal from '../common/modal/Modal';
import './PreviewModal.css';

const PreviewModal = ({
	image,
	handleImageNameChange,
	isModalOpen,
	setIsModalOpen,
	isUploadSuccessfull,
	setIsUploadSuccessfull,
}) => {
	function handleUpload(event) {
		event.preventDefault();
		setIsUploadSuccessfull(true);
	}

	return (
		<Modal
			modalOpen={isModalOpen}
			setModal={setIsModalOpen}
			showButtons={false}
			containerClassName='preview-modal'
		>
			<form onSubmit={handleUpload} className='preview-modal-form'>
				<CustomInput
					type='text'
					label='Image name'
					name='imagename'
					value={image.name}
					onChange={handleImageNameChange}
				/>
				<button
					type='submit'
					className='images-upload-btn'
					disabled={isUploadSuccessfull}
				>
					Upload
				</button>
			</form>
			{isUploadSuccessfull && (
				<p className='image-upload-success'>Image uploaded successfully.</p>
			)}
			<div className='preview-container'>
				<img src={image.url} alt={image.name} />
			</div>
		</Modal>
	);
};

PreviewModal.propTypes = {
	image: PropTypes.shape({
		name: PropTypes.string,
		url: PropTypes.string,
	}).isRequired,
	handleImageNameChange: PropTypes.func.isRequired,
	isModalOpen: PropTypes.bool.isRequired,
	setIsModalOpen: PropTypes.func.isRequired,
	isUploadSuccessfull: PropTypes.bool.isRequired,
	setIsUploadSuccessfull: PropTypes.func.isRequired,
};

export default PreviewModal;
