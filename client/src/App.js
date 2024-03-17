import {Navigate, Route, Routes} from 'react-router-dom';
import './App.css';
import Footer from './components/footer/Footer';
import Header from './components/header/Header';
import Pricing from './components/pricing/Pricing';
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
import {AuthProvider} from './contexts/AuthContext';
import ProtectedRoute from './utils/ProtectedRoute';
import CheckAuth from './utils/CheckAuth';

function App() {
	return (
		<div className='App'>
			<AuthProvider>
				<CheckAuth />
				<ScrollToAnchor />
				<Header />
				<Routes>
					<Route index element={<Navigate to='/welcome' />} />
					<Route
						path='/dashboard'
						element={
							<ProtectedRoute>
								<Dashboard />
							</ProtectedRoute>
						}
					/>
					<Route path='/signup' element={<Signup />} />
					<Route path='/signin' element={<Signin />} />
					<Route path='/pricing' element={<Pricing />} />
					<Route path='/welcome' element={<Home />} />
					<Route path='/contactus' element={<Contactus />} />
					<Route path='/about' element={<About />} />
					<Route path='/forgot-password' element={<ForgotPassword />} />
					<Route path='/reset-password' element={<ResetPassword />} />
					<Route path='/docs' element={<ApiDocs />} />
					<Route
						path='/account'
						element={
							<ProtectedRoute>
								<Account />
							</ProtectedRoute>
						}
					/>
					<Route
						path='/admin'
						element={
							<ProtectedRoute>
								<AdminDashboard />
							</ProtectedRoute>
						}
					/>
				</Routes>
				<Footer />
			</AuthProvider>
		</div>
	);
}
export default App;
