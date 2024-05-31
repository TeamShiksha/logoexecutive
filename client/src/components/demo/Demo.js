import {useState} from 'react';
import CustomInput from '../common/input/CustomInput';
import './Demo.css';
import {useApi} from '../../hooks/useApi';
import Spinner from '../spinner/Spinner';

const Demo = () => {
	const [brandName, setBrandName] = useState('');
	const {errorMsg, makeRequest, data, loading} = useApi({
		url: `api/public/logo`,
		method: 'get',
		params: {domain: brandName},
	});
	const handleBrandNameChange = (event) => {
		setBrandName(event.target.value);
	};
	const handleFormChange = async (e) => {
		e.preventDefault();
		await makeRequest();
	};
	return (
		<section id='demo' className='demo-container'>
			<form onSubmit={handleFormChange} noValidate data-testid='demo-form'>
				<h2 className='demo-heading'>Try it now</h2>
				<p
					className='demo-input-description'
					data-testid='demo-input-description'
				>
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
			</form>
			{errorMsg && <p className='image-display-error'>{errorMsg}</p>}
			<div className='demo-displaylogo'>
				{!errorMsg && data && brandName && <img src={data.data} alt='Logo' />}
			</div>
		</section>
	);
};
export default Demo;
