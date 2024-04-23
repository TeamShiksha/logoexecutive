import React from 'react';
import ReactDOM from 'react-dom/client';
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
					<App />
				</BrowserRouter>
			</UserProvider>
		</AuthProvider>
	</React.StrictMode>,
);
