import {IconContext} from 'react-icons/lib';
import {FaCheck} from 'react-icons/fa6';
import {RxCross2} from 'react-icons/rx';
import './ResponseCard.css';

function ResponseCard({
	countdown,
	successMsg = false,
	errorMsg = false,
	title = '',
}) {
	return (
		<section className='reset-success-card-wrapper' role='reset-success-alert'>
			{errorMsg ? (
				<div className='reset-failure-card'>
					<IconContext.Provider
						value={{color: 'red', className: 'global-class-name'}}
					>
						<RxCross2 size={50} />
					</IconContext.Provider>
					<h3 className='reset-success-title'>{title}</h3>
					<p className='reset-success-message'>{errorMsg}</p>
				</div>
			) : (
				<div className='reset-success-card'>
					<IconContext.Provider
						value={{color: '#0bae69', className: 'global-class-name'}}
					>
						<FaCheck size={50} />
					</IconContext.Provider>
					<h3 className='reset-success-title'>{title}</h3>
					<p className='reset-success-message'>{successMsg}</p>
					<div className='reset-success-countdown'>
						<p>Redirecting to sign in </p>
						<p>{countdown}</p>
					</div>
				</div>
			)}
		</section>
	);
}

export default ResponseCard;
