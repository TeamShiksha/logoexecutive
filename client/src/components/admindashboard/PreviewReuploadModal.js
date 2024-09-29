import PropTypes from 'prop-types';
import CustomInput from '../common/input/CustomInput';
import Modal from '../common/modal/Modal';
import {useApi} from '../../hooks/useApi';
import './PreviewModal.css';

function PreviewReuploadModal({
	image,
	handleImageNameChange,
	isModalOpen,
	setIsModalOpen,
	Id,
	ImageName,
}) {
	const formData = new FormData();
	formData.append('imageName', ImageName + '.' + image.name.split('.')[1]);
	formData.append('logo', image?.data);
	formData.append('id', Id);
	const {data, makeRequest, isSuccess, errorMsg, loading} = useApi({
		url: `api/admin/reupload`,
		method: 'put',
		headers: {
			'Content-Type': 'multipart/form-data',
		},
		data: formData,
	});

	async function handleUpload(event) {
		event.preventDefault();
		const success = await makeRequest();
		if (success) {
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
					value={ImageName}
					onChange={handleImageNameChange}
					disabled='true'
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

PreviewReuploadModal.propTypes = {
	image: PropTypes.shape({
		name: PropTypes.string,
		url: PropTypes.string,
	}).isRequired,
	handleImageNameChange: PropTypes.func.isRequired,
	isModalOpen: PropTypes.bool.isRequired,
	setIsModalOpen: PropTypes.func.isRequired,
	Id: PropTypes.string.isRequired,
	ImageName: PropTypes.string.isRequired,
};

export default PreviewReuploadModal;
