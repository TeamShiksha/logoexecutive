import VerificationStatus from '../../components/verificationStatus/VerificationStatus';
import './Verification.css';
import {useLocation, Navigate} from 'react-router';
function Verification() {
	const location = useLocation();
	const queryParams = new URLSearchParams(location.search);
	const token = queryParams.get('token') || '';
	return (
		<div className='main'>
			{token.length > 0 ? (
				<VerificationStatus token={token} />
			) : (
				<Navigate to='/welcome' />
			)}
		</div>
	);
}

export default Verification;
