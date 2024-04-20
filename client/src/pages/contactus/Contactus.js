import {useState} from 'react';
import {FiArrowRight} from 'react-icons/fi';
import CustomInput from '../../components/common/input/CustomInput';
import {Link} from 'react-router-dom';
import './Contactus.css';

function Contactus() {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [message, setMessage] = useState('');
	const sendMessage = () => {};

	return (
		<div className='contact-main-cont' id='contactus'>
			<div className='contact-subcont-first'>
				<h3>Contact us</h3>
			</div>
			<div className='contact-subcont-second'>
				<div className='contact-subcont-second-first-col'>
					<div className='contact-input-field'>
						<CustomInput
							name='name'
							label='name'
							type='text'
							id='name'
							value={name}
							onChange={(e) => setName(e.target.value)}
						/>
						<CustomInput
							name='email'
							label='email'
							type='text'
							id='email'
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
					</div>
					<div className='contact-textarea'>
						<textarea
							id='message'
							cols='30'
							rows='12'
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							className='textarea'
						/>
						<label className='message-label' htmlFor='message'>
							message
						</label>
					</div>
					<button onClick={sendMessage} className='contact-button'>
						Send Message
					</button>
				</div>
				<div className='contact-subcont-second-sec-col'>
					<div className='contact-get-in-touch contact-text'>
						<h3>Get in touch</h3>
						<p>
							We’re always here to help. Contact us if you are experiencing
							issues with our product or have any questions.
						</p>
						<div className='custom-link'>
							<Link to='/welcome#demo'>Get a demo</Link>
							<FiArrowRight
								className='contact-arrow-icon'
								data-testid='contact-arrow-icon'
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Contactus;
