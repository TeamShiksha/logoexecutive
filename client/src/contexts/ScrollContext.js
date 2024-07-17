import React, {createContext, useContext, useEffect} from 'react';
import {useLocation} from 'react-router-dom';

const ScrollContext = createContext();

export const ScrollProvider = ({children}) => {
	const location = useLocation();

	useEffect(() => {
		window.scrollTo(0, 0);
	}, [location]);

	return <ScrollContext.Provider value={{}}>{children}</ScrollContext.Provider>;
};

export const useScroll = () => useContext(ScrollContext);
