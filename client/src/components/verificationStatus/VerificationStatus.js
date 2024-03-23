import React from 'react';
import './VerificationStatus.css';
import {useApi} from '../../hooks/useApi';
import {useEffectOnce} from '../../hooks/useEffectOnce';
function VerificationStatus(props) {
	const {token} = props;
	const {errorMsg, makeRequest, loading} = useApi(
		{
			url: `auth/verify?token=${token}`,
			method: 'get',
		},
		true,
	);
	useEffectOnce(makeRequest);
	return !loading ? (
		<div className='inputlogin'>
			<h3 className='head3'>
				{errorMsg || 'Email has been verified successfully'}
			</h3>
		</div>
	) : null;
}

export default VerificationStatus;
