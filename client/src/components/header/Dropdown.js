import {Link} from 'react-router-dom';

const Dropdown = ({handleLogout}) => {
	return (
		<ul className='dropdown'>
			<li key={0} className='menu-items'>
				<Link to='/account'>
					<div>Profile</div>
				</Link>
			</li>
			<li key={1} className='menu-items' onClick={handleLogout}>
				<div>Logout</div>
			</li>
		</ul>
	);
};

export default Dropdown;
