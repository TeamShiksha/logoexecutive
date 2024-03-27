import {useEffect, useRef} from 'react';
import {useLocation} from 'react-router-dom';

function ScrollToAnchor() {
	const location = useLocation();
	const lastHash = useRef('');
	useEffect(() => {
		if (location.hash) {
			lastHash.current = location.hash.slice(1);
		}
		if (lastHash.current && document.getElementById(lastHash.current)) {
			setTimeout(() => {
				document
					.getElementById(lastHash.current)
					?.scrollIntoView({behavior: 'smooth', block: 'center'});
				lastHash.current = '';
			}, 100);
		}
	}, [location]);
	return null;
}

export default ScrollToAnchor;
