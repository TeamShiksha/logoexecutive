import Divider from '../../components/common/divider/Divider';
import Profile from '../../components/profile/Profile';
import Settings from '../../components/settings/Settings';
import './Account.css';

function Account() {
	return (
		<article className='account-container' data-testid='testid-account'>
			<Profile />
			<Divider />
			<Settings />
		</article>
	);
}

export default Account;
