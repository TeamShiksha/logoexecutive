import React from 'react';
import {render, act} from '@testing-library/react';
import {MemoryRouter, Routes, Route} from 'react-router-dom';
import {ScrollProvider} from './ScrollContext';

jest.mock('react-router-dom', () => {
	const originalModule = jest.requireActual('react-router-dom');
	return {
		...originalModule,
		useLocation: jest.fn(),
	};
});

describe('ScrollContext', () => {
	it('scrolls to the top on location change', () => {
		const {useLocation} = require('react-router-dom');
		let location = {pathname: '/'};
		useLocation.mockReturnValue(location);

		window.scrollTo = jest.fn();

		const App = ({path}) => (
			<MemoryRouter initialEntries={[path]}>
				<ScrollProvider>
					<Routes>
						<Route path='/' element={<div>Home</div>} />
						<Route path='/new-path' element={<div>New Path</div>} />
					</Routes>
				</ScrollProvider>
			</MemoryRouter>
		);

		const {rerender} = render(<App path='/' />);

		expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
		window.scrollTo.mockClear();

		location = {pathname: '/new-path'};
		useLocation.mockReturnValue(location);

		act(() => {
			rerender(<App path='/new-path' />);
		});

		expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
	});
});
