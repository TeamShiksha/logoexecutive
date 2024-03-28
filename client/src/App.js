import {Navigate, Route, Routes} from 'react-router-dom';
import Footer from './components/footer/Footer';
import Header from './components/header/Header';
import Pricing from './components/pricing/Pricing';
import {
	About,
	Account,
	// AdminDashboard,
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
import ProtectedRoute from './utils/ProtectedRoute';
import './App.css';

function App() {
	return (
		<div className='App'>
			<ScrollToAnchor />
			<Header />
			<Routes>
				<Route index element={<Navigate to='/welcome' />} />
				<Route path='/about' element={<About />} />
				<Route path='/contactus' element={<Contactus />} />
				<Route path='/docs' element={<ApiDocs />} />
				<Route path='/forgot-password' element={<ForgotPassword />} />
				<Route path='/pricing' element={<Pricing />} />
				<Route path='/reset-password' element={<ResetPassword />} />
				<Route path='/signin' element={<Signin />} />
				<Route path='/signup' element={<Signup />} />
				<Route path='/welcome' element={<Home />} />
				<Route
					path='/account'
					element={
						<ProtectedRoute>
							<Account />
						</ProtectedRoute>
					}
				/>
				{/* <Route
					path='/admin'
					element={
						<ProtectedRoute>
							<AdminDashboard />
						</ProtectedRoute>
					}
				/> */}
				<Route
					path='/dashboard'
					element={
						<ProtectedRoute>
							<Dashboard />
						</ProtectedRoute>
					}
				/>
			</Routes>
			<Footer />
		</div>
	);
}
export default App;
