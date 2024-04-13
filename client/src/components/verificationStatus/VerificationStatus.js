import './VerificationStatus.css';
import {useApi} from '../../hooks/useApi';
import {useNavigate} from 'react-router-dom';
import {useState, useEffect} from 'react';
import {useEffectOnce} from '../../hooks/useEffectOnce';
import {FaCheck} from 'react-icons/fa6';
import {RxCross2} from 'react-icons/rx';
import ResponseCard from '../common/responseCard/ResponseCard';

function VerificationStatus(props) {
	const [countdown, setCountdown] = useState(3);
	const navigate = useNavigate();
	const {token} = props;

	const {errorMsg, makeRequest, loading, isSuccess, data} = useApi(
		{
			url: `auth/verify?token=${token}`,
			method: 'get',
		},
		true,
	);
	useEffect(() => {
		let timer = null;
		if (isSuccess) {
			timer = setInterval(() => {
				if (countdown > 1) {
					setCountdown((prevCount) => prevCount - 1);
				} else {
					clearInterval(timer);
					navigate('/welcome');
				}
			}, 1000);
		}
		return () => {
			clearInterval(timer);
		};
	}, [isSuccess, countdown]);
	useEffectOnce(makeRequest, []);
	return (
		<section data-testid='verificationStatus'>
			{loading ? (
				<ResponseCard title={'Loading...'} />
			) : isSuccess ? (
				<ResponseCard
					countdown={countdown}
					message={data?.message}
					Icon={<FaCheck className='response-success-icon' />}
					title={'Email verified successfully'}
				/>
			) : (
				<ResponseCard
					message={errorMsg}
					Icon={<RxCross2 className='response-failure-icon' />}
					title={'Invalid Token'}
				/>
			)}
		</section>
	);
}

export default VerificationStatus;
