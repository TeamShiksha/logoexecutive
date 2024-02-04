import {render, screen} from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
	render(<App />);
	const linkElement = screen.getByText(/Empower Your Branding: Logo Executive Where Logos Shine in Every Size/i);
	expect(linkElement).toBeInTheDocument();
});
