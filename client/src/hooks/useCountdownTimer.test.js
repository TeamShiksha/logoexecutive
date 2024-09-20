import {renderHook, act} from '@testing-library/react-hooks';
import {afterEach, describe, expect, vi} from 'vitest';
import useCountdownTimer from './useCountdownTimer';

vi.useFakeTimers();

describe('useCountdownTimer', () => {
	afterEach(() => {
		vi.clearAllTimers();
		vi.useRealTimers();
	});
	beforeEach(() => {
		vi.useFakeTimers();
	});
	it('should navigate to "/home" when countdown reaches 0', () => {
		const navigateMock = vi.fn();
		let countdown = 3;
		const setCountdownMock = vi.fn().mockImplementation((value) => {
			countdown = value;
		});
		const {result} = renderHook(() =>
			useCountdownTimer(true, navigateMock, countdown, setCountdownMock),
		);
		act(() => {
			vi.advanceTimersByTime(3000);
		});
		setTimeout(() => {
			expect(result.current).toBe(0);
			expect(navigateMock).toHaveBeenCalledWith('/home');
		}, 3000);
	});

	it('should not navigate when isSuccess is false', () => {
		const navigateMock = vi.fn();
		let countdown = 3;
		const setCountdownMock = vi.fn().mockImplementation((value) => {
			countdown = value;
		});
		const {result} = renderHook(() =>
			useCountdownTimer(false, navigateMock, countdown, setCountdownMock),
		);
		act(() => {
			vi.advanceTimersByTime(3000);
		});
		setTimeout(() => {
			expect(result.current).toBe(3);
			expect(navigateMock).not.toHaveBeenCalled();
		}, 3000);
	});

	it('should update countdown correctly', () => {
		const navigateMock = vi.fn();
		let countdown = 3;
		const setCountdownMock = vi.fn().mockImplementation((value) => {
			countdown = value;
		});
		const {result} = renderHook(() =>
			useCountdownTimer(true, navigateMock, countdown, setCountdownMock),
		);
		act(() => {
			vi.advanceTimersByTime(2000);
		});
		setTimeout(() => {
			expect(result.current).toBe(1);
		}, 2000);
	});

	it('should clear interval and navigate when countdown reaches 0', () => {
		const navigateMock = vi.fn();
		let countdown = 1;
		const setCountdownMock = vi.fn().mockImplementation((value) => {
			countdown = value;
		});
		const {result} = renderHook(() =>
			useCountdownTimer(true, navigateMock, countdown, setCountdownMock),
		);
		act(() => {
			vi.advanceTimersByTime(1000);
		});
		setTimeout(() => {
			expect(result.current).toBe(0);
		}, 1000);
		expect(navigateMock).toHaveBeenCalledWith('/home');
	});
});
