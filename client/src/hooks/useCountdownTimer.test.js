import {renderHook, act} from '@testing-library/react-hooks';
import useCountdownTimer from './useCountdownTimer';

jest.useFakeTimers();

describe('useCountdownTimer', () => {
	afterEach(() => {
		jest.clearAllTimers();
		jest.useRealTimers();
	});
	beforeEach(() => {
		jest.useFakeTimers();
	});
	it('should navigate to "/welcome" when countdown reaches 0', () => {
		const navigateMock = jest.fn();
		let countdown = 3;
		const setCountdownMock = jest.fn().mockImplementation((value) => {
			countdown = value;
		});
		const {result} = renderHook(() =>
			useCountdownTimer(true, navigateMock, countdown, setCountdownMock),
		);
		act(() => {
			jest.advanceTimersByTime(3000);
		});
		setTimeout(() => {
			expect(result.current).toBe(0);
			expect(navigateMock).toHaveBeenCalledWith('/welcome');
		}, 3000);
	});

	it('should not navigate when isSuccess is false', () => {
		const navigateMock = jest.fn();
		let countdown = 3;
		const setCountdownMock = jest.fn().mockImplementation((value) => {
			countdown = value;
		});
		const {result} = renderHook(() =>
			useCountdownTimer(false, navigateMock, countdown, setCountdownMock),
		);
		act(() => {
			jest.advanceTimersByTime(3000);
		});
		setTimeout(() => {
			expect(result.current).toBe(3);
			expect(navigateMock).not.toHaveBeenCalled();
		}, 3000);
	});

	it('should update countdown correctly', () => {
		const navigateMock = jest.fn();
		let countdown = 3;
		const setCountdownMock = jest.fn().mockImplementation((value) => {
			countdown = value;
		});
		const {result} = renderHook(() =>
			useCountdownTimer(true, navigateMock, countdown, setCountdownMock),
		);
		act(() => {
			jest.advanceTimersByTime(2000);
		});
		setTimeout(() => {
			expect(result.current).toBe(1);
		}, 2000);
	});
});
