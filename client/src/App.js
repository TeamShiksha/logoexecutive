import PropTypes from 'prop-types';
import {Navigate, Route, Routes} from 'react-router-dom';
import './App.css';
import Footer from './components/footer/Footer';
import Header from './components/header/Header';
import Pricing from './components/pricing/Pricing';
import useLocalStorage from './hooks/useLocalStorage';
import {
	About,
	Account,
	AdminDashboard,
	ApiDocs,
	Contactus,
	Dashboard,
	ForgotPassword,
	Home,
	ResetPassword,
	Signin,
	Signup,
} from './pages';
import ScrollToAnchor from './utils/ScrollToAnchor';

function App() {
	const [userInfo, setUserInfo] = useLocalStorage('logged_in_user', null);

	function ProtectedRoute({children}) {
		return userInfo ? children : <Navigate to='/signin' />;
	}

	ProtectedRoute.propTypes = {
		children: PropTypes.node.isRequired,
	};

	const setUser = (user) => {
		setUserInfo(user);
	};

	const logoutUser = () => {
		setUserInfo(null);
	};

	return (
		<div className='App'>
			<ScrollToAnchor />
			<Header user={userInfo} logoutUser={logoutUser} />
			<Routes>
				<Route index element={<Navigate to='/welcome' />} />
				<Route
					path='/dashboard/*'
					element={
						// <ProtectedRoute>
						<Dashboard />
						// {/* </ProtectedRoute> */}
					}
				/>
				<Route path='/signup' element={<Signup />} />
				<Route path='/signin' element={<Signin setUser={setUser} />} />
				<Route path='/pricing' element={<Pricing />} />
				<Route path='/welcome' element={<Home />} />
				<Route path='/contactus' element={<Contactus />} />
				<Route path='/about' element={<About />} />
				<Route path='/forgot-password' element={<ForgotPassword />} />
				<Route path='/reset-password' element={<ResetPassword />} />
				<Route path='/docs' element={<ApiDocs />} />
				<Route path='/account' element={<Account />} />
				<Route path='/admin' element={<AdminDashboard />} />
			</Routes>
			<Footer />
		</div>
	);
}
export default App;

//test
