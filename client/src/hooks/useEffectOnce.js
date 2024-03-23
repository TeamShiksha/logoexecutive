import {useEffect, useRef} from 'react';

export const useEffectOnce = (callback) => {
	const didMount = useRef(false);
	useEffect(() => {
		if (!didMount.current) {
			didMount.current = true;
			callback();
		}
	}, []);
};
