import './Verification.css';
import {useApi} from '../../hooks/useApi';
import {useNavigate, useLocation, Navigate} from 'react-router-dom';
import {useState, useEffect} from 'react';
import {FaCheck} from 'react-icons/fa6';
import {RxCross2} from 'react-icons/rx';
import ResponseCard from '../../components/common/responseCard/ResponseCard';

export default function Verification() {
	const location = useLocation();
	const queryParams = new URLSearchParams(location.search);
	const token = queryParams.get('token') || '';
	const [countdown, setCountdown] = useState(3);
	const navigate = useNavigate();

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
	}, [isSuccess, countdown, navigate]);

	useEffect(() => {
		makeRequest();
	}, []);

	return (
		<div className='main'>
			{token.length > 0 ? (
				<section data-testid='verificationStatus'>
					{loading ? (
						<ResponseCard title={'Email Verification'} message='Verifying...' />
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
			) : (
				<Navigate to='/welcome' />
			)}
		</div>
	);
}
