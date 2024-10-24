import {useState} from 'react';
import './RaiseRequest.css';
import RaiseRequestModal from '../raiserequestmodal/RaiseRequestModal';

function RaiseRequest() {
	const [openRaiseRequestModal, setOpenRaiseRequestModal] = useState(false);

	const handleRaiseRequest = () => {
		setOpenRaiseRequestModal(true);
	};

	return (
		<>
			<RaiseRequestModal
				modalOpen={openRaiseRequestModal}
				setModal={setOpenRaiseRequestModal}
			/>
			<div className='raise-request-container'>
				<p className='raise-request-text'>
					<strong>Couldn't find your logo try raising a request!</strong>
				</p>
				<button
					type='button'
					className='raise-request-button'
					onClick={handleRaiseRequest}
				>
					Raise a Request
				</button>
			</div>
		</>
	);
}

export default RaiseRequest;
