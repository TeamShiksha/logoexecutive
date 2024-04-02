import {useState} from 'react';
import CustomInput from '../common/input/CustomInput';
import './Demo.css';

const Demo = () => {
	const [brandName, setBrandName] = useState('');
	const handleBrandNameChange = (event) => {
		setBrandName(event.target.value);
	};

	return (
		<section id='demo' className='demo-container'>
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
		</section>
	);
};

export default Demo;
