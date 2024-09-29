import React from 'react';
import {render} from '@testing-library/react';
import {MemoryRouter, Routes, Route} from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import {ScrollProvider} from './ScrollContext';

vi.mock('react-router-dom', () => {
	const originalModule = vi.importActual('react-router-dom');
	return {
		...originalModule,
		useLocation: vi.fn(),
	};
});

describe('ScrollContext', () => {
	it('scrolls to the top on location change', () => {
		const {useLocation} = require('react-router-dom');
		let location = {pathname: '/'};
		useLocation.mockReturnValue(location);

		window.scrollTo = vi.fn();

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

		rerender(<App path='/new-path' />);

		expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
	});
});
