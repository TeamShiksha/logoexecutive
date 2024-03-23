import VerificationStatus from '../../components/verificationStatus/VerificationStatus';
import Error404 from '../Error404/Error404';
import './Verification.css';
import {useLocation} from 'react-router';
function Verification() {
	const location = useLocation();
	const queryParams = new URLSearchParams(location.search);
	const token = queryParams.get('token') || '';
	return (
		<div className='main'>
			{token.length > 0 ? <VerificationStatus token={token} /> : <Error404 />}
		</div>
	);
}

export default Verification;
