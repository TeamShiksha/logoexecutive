import {useEffect} from 'react';

const useCountdownTimer = (
	isSuccess,
	navigate,
	countdown,
	setCountdown,
	route = '/home',
) => {
	useEffect(() => {
		let timer = null;
		if (isSuccess) {
			timer = setInterval(() => {
				if (countdown > 1) {
					setCountdown((prevCount) => prevCount - 1);
				} else {
					clearInterval(timer);
					navigate(route);
				}
			}, 1000);
		}
		return () => {
			clearInterval(timer);
		};
	}, [isSuccess, countdown, navigate]);

	return countdown;
};

export default useCountdownTimer;
