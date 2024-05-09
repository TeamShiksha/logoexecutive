import PropTypes from 'prop-types';
import {IoIosCloseCircleOutline} from 'react-icons/io';
import './Modal.css';

function Modal({
	modalOpen,
	children,
	setModal,
	handleConfirm,
	showButtons,
	containerClassName,
	showCloseIcon = true,
	loading,
}) {
	const closeModal = () => setModal(false);
	const stopPropagation = (event) => event.stopPropagation();
	if (modalOpen) {
		document.body.style.overflow = 'hidden';
	} else {
		document.body.style.overflow = 'scroll';
	}

	return modalOpen ? (
		<div className='modal-bg' onClick={closeModal} data-testid='modal-bg'>
			<div
				className={`modal-container ${containerClassName || ''}`}
				onClick={stopPropagation}
			>
				{showCloseIcon && (
					<IoIosCloseCircleOutline
						className='modal-close'
						onClick={closeModal}
						data-testid='modal-close'
					/>
				)}
				<div className='modal-content'>{children}</div>
				{showButtons && (
					<footer className='modal-buttons-container'>
						<button className='modal-button' onClick={closeModal}>
							Cancel
						</button>
						<button
							className='modal-button modal-ok-button'
							onClick={handleConfirm}
							disabled={loading}
						>
							Okay
						</button>
					</footer>
				)}
			</div>
		</div>
	) : null;
}

Modal.propTypes = {
	modalOpen: PropTypes.bool,
	children: PropTypes.node,
	setModal: PropTypes.func,
	showButtons: PropTypes.bool,
	containerClassName: PropTypes.string,
	showCloseIcon: PropTypes.bool,
	handleConfirm: PropTypes.func,
	loading: PropTypes.bool,
};

export default Modal;
