import {useEffect, useState} from 'react';
import CustomInput from '../common/input/CustomInput';
import './Demo.css';
import {useApi} from '../../hooks/useApi';
import Spinner from '../spinner/Spinner';

const Demo = () => {
	const [brandName, setBrandName] = useState('');
	const [validationError, setValidationError] = useState('');
	const [imageUrl, setImageUrl] = useState('');
	const {errorMsg, makeRequest, data, loading, isSuccess, setErrorMsg} = useApi(
		{
			url: `api/public/logo`,
			method: 'get',
			params: {domain: brandName},
		},
	);
	const handleBrandNameChange = (event) => {
		setBrandName(event.target.value);
	};
	const validateBrandName = (brandName) => {
		if (brandName === '') return 'Brand Name is required';
		const pattern = /^[A-Za-z0-9&-/:.]+$/;
		if (!pattern.test(brandName)) {
			return 'Invalid Brand Name';
		}
	};

	const handleFormChange = (e) => {
		e.preventDefault();
		setValidationError(null);
		const error = validateBrandName(brandName);
		if (error) {
			setValidationError(error);
			setImageUrl('');
			setErrorMsg('');
		} else {
			makeRequest();
		}
	};
	useEffect(() => {
		if (data && data.data) {
			setImageUrl(data.data);
		}
	}, [data]);
	return (
		<section id='demo' className='demo-container'>
			<form onSubmit={handleFormChange} noValidate>
				<h2 className='demo-heading'>Try it now</h2>
				<p className='demo-input-description'>
					Enter the name of a brand or the URL of a website for which you would
					like to retrieve logos.
				</p>
				<CustomInput
					type='text'
					label='Brand name'
					value={brandName}
					name='brandname'
					onChange={handleBrandNameChange}
				/>
				<button className='demo-button' type='submit' disabled={loading}>
					{loading ? <Spinner /> : 'Go'}
				</button>
				<p className='image-display-error' aria-live='assertive' role='alert'>
					{errorMsg || validationError || ''}
				</p>
				{isSuccess && imageUrl && (
					<div className='demo-displaylogo'>
						<img src={imageUrl} alt='Logo' />
					</div>
				)}
			</form>
		</section>
	);
};
export default Demo;
