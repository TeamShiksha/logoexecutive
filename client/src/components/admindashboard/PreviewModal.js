import PropTypes from 'prop-types';
import CustomInput from '../common/input/CustomInput';
import Modal from '../common/modal/Modal';
import {useApi} from '../../hooks/useApi';
import './PreviewModal.css';

function PreviewModal({
	image,
	handleImageNameChange,
	isModalOpen,
	setIsModalOpen,
	fetchUploadedImages,
}) {
	const formData = new FormData();
	formData.append('imageName', image?.name);
	formData.append('logo', image?.data);
	const {data, makeRequest, isSuccess, errorMsg, loading} = useApi(
		{
			url: `api/admin/upload`,
			method: 'post',
			headers: {
				'Content-Type': 'multipart/form-data',
			},
			data: formData,
		},
		true,
	);

	async function handleUpload(event) {
		event.preventDefault();
		const success = await makeRequest();
		if (success) {
			fetchUploadedImages();
			setTimeout(() => {
				setIsModalOpen(false);
			}, 3000);
		}
	}

	return (
		<Modal
			modalOpen={isModalOpen}
			setModal={setIsModalOpen}
			showButtons={false}
			containerClassName='preview-modal'
		>
			<form
				onSubmit={handleUpload}
				className='preview-modal-form'
				data-testid='preview-modal-form'
			>
				<CustomInput
					type='text'
					label='Image name'
					name='imagename'
					value={image?.name}
					onChange={handleImageNameChange}
					disabled={isSuccess}
				/>
				<button
					type='submit'
					className='images-upload-btn'
					disabled={isSuccess || loading}
				>
					Upload
				</button>
			</form>
			{isSuccess && <p className='image-upload-success'>{data?.message}</p>}
			{errorMsg && <p className='image-upload-error'>{errorMsg}</p>}
			<div className='preview-container'>
				<img src={image?.url} alt={image?.name} data-testid='image-preview' />
			</div>
		</Modal>
	);
}

PreviewModal.propTypes = {
	image: PropTypes.shape({
		name: PropTypes.string,
		url: PropTypes.string,
	}).isRequired,
	handleImageNameChange: PropTypes.func.isRequired,
	isModalOpen: PropTypes.bool.isRequired,
	setIsModalOpen: PropTypes.func.isRequired,
	fetchUploadedImages: PropTypes.func.isRequired,
};

export default PreviewModal;
