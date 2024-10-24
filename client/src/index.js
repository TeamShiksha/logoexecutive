import React from 'react';
import ReactDOM from 'react-dom/client';
import {ScrollProvider} from './contexts/ScrollContext';
import App from './App';
import {BrowserRouter} from 'react-router-dom';
import {AuthProvider} from './contexts/AuthContext';
import {UserProvider} from './contexts/UserContext';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
	<React.StrictMode>
		<AuthProvider>
			<UserProvider>
				<BrowserRouter>
					<ScrollProvider>
						<App />
					</ScrollProvider>
				</BrowserRouter>
			</UserProvider>
		</AuthProvider>
	</React.StrictMode>,
);
