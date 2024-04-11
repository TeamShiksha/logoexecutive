import './VerificationStatus.css';
import {useApi} from '../../hooks/useApi';
import {useEffectOnce} from '../../hooks/useEffectOnce';
import EmailVerificationSuccessCard from '../VerificationStatusCard/SuccessCard';
import VerificationState from '../VerificationState/VerificationState';
// import EmailVerificationSuccessCard from '../SuccessCards/SuccessCard';
// import ResetPasswordFailureCard from '../SuccessCards/FailureCard';
function VerificationStatus(props) {
	const {token} = props;
	const {errorMsg, makeRequest, loading, isSuccess} = useApi(
		{
			url: `auth/verify?token=${token}`,
			method: 'get',
		},
		true,
	);
	useEffectOnce(makeRequest, []);
	return (
		<section data-testid='verificationStatus'>
			<VerificationState
				loading={loading}
				isSuccess={isSuccess}
				errorMsg={errorMsg}
				successMessage='Email verified successfully'
			/>
		</section>
	);
}

export default VerificationStatus;
