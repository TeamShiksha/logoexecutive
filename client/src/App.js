import {Navigate, Route, Routes} from 'react-router-dom';
import Footer from './components/footer/Footer';
import Header from './components/header/Header';
import Pricing from './components/pricing/Pricing';
import Verification from './pages/verification/Verification';
import ApiDocs from './pages/docs/ApiDocs';
import {
	About,
	Account,
	AdminDashboard,
	Contactus,
	Dashboard,
	ForgotPassword,
	Home,
	ResetPassword,
	Signin,
	Signup,
	Operator,
} from './pages';
import ScrollToAnchor from './utils/ScrollToAnchor';
import ProtectedRoute from './utils/ProtectedRoute';
import NotFound from './components/notfound/NotFound';
import './App.css';

const dummyQueries = [
	{
		name: 'Sujal Maiti',
		email: 'sujal@example.com',
		message:
			'Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime mollitia,molestiae quas vel sint commodi repudiandae consequuntur voluptatum laborumnumquam blanditiis harum quisquam eius sed odit fugiat iusto fuga praesentiumoptio, eaque rerum!',
	},
	{
		name: 'Sujal Maiti',
		email: 'sujal@example.com',
		message:
			'Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime mollitia,molestiae quas vel sint commodi repudiandae consequuntur voluptatum laborumnumquam blanditiis harum quisquam eius sed odit fugiat iusto fuga praesentiumoptio, eaque rerum!',
	},

	{
		name: 'Sujal Maiti',
		email: 'sujal@example.com',
		message:
			'Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime mollitia,molestiae quas vel sint commodi repudiandae consequuntur voluptatum laborumnumquam blanditiis harum quisquam eius sed odit fugiat iusto fuga praesentiumoptio, eaque rerum!',
	},

	{
		name: 'Sujal Maiti',
		email: 'sujal@example.com',
		message:
			'Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime mollitia,molestiae quas vel sint commodi repudiandae consequuntur voluptatum laborumnumquam blanditiis harum quisquam eius sed odit fugiat iusto fuga praesentiumoptio, eaque rerum!',
	},
	{
		name: 'Sujal Maiti',
		email: 'sujal@example.com',
		message:
			'Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime mollitia,molestiae quas vel sint commodi repudiandae consequuntur voluptatum laborumnumquam blanditiis harum quisquam eius sed odit fugiat iusto fuga praesentiumoptio, eaque rerum!',
	},
	{
		name: 'Sujal Maiti',
		email: 'sujal@example.com',
		message:
			'Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime mollitia,molestiae quas vel sint commodi repudiandae consequuntur voluptatum laborumnumquam blanditiis harum quisquam eius sed odit fugiat iusto fuga praesentiumoptio, eaque rerum!',
	},

	{
		name: 'Sujal Maiti',
		email: 'sujal@example.com',
		message:
			'Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime mollitia,molestiae quas vel sint commodi repudiandae consequuntur voluptatum laborumnumquam blanditiis harum quisquam eius sed odit fugiat iusto fuga praesentiumoptio, eaque rerum!',
	},
];

function App() {
	return (
		<div className='App'>
			<ScrollToAnchor />
			<Header />
			<Routes>
				<Route index element={<Navigate to='/home' />} />
				<Route path='/about' element={<About />} />
				<Route path='/contactus' element={<Contactus />} />
				<Route path='/docs' element={<ApiDocs />} />
				<Route path='/forgot-password' element={<ForgotPassword />} />
				<Route path='/pricing' element={<Pricing />} />
				<Route path='/reset-password' element={<ResetPassword />} />
				<Route path='/signin' element={<Signin />} />
				<Route path='/signup' element={<Signup />} />
				<Route path='/home' element={<Home />} />
				<Route path='/verify' element={<Verification />} />
				<Route
					path='/profile'
					element={
						<ProtectedRoute>
							<Account />
						</ProtectedRoute>
					}
				/>
				<Route
					path='/admin'
					element={
						<ProtectedRoute adminOnly={true}>
							<AdminDashboard />
						</ProtectedRoute>
					}
				/>
				<Route
					path='/dashboard'
					element={
						<ProtectedRoute>
							<Dashboard />
						</ProtectedRoute>
					}
				/>
				<Route path='*' element={<NotFound />} />
				<Route
					path='/operator'
					element={
						<ProtectedRoute>
							<Operator queries={dummyQueries} />
						</ProtectedRoute>
					}
				/>
			</Routes>
			<Footer />
		</div>
	);
}
export default App;
