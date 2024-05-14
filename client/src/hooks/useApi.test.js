import {renderHook, act} from '@testing-library/react-hooks';
import {useApi} from './useApi';

describe('useApi', () => {
	it('should return initial state', () => {
		const {result} = renderHook(() => useApi({}));
		expect(result.current.data).toBeNull();
		expect(result.current.errorMsg).toBe('');
		expect(result.current.isSuccess).toBeFalsy();
		expect(result.current.loading).toBeFalsy();
	});

	it('should set loading to true when making a request', async () => {
		const {result} = renderHook(() => useApi({}));
		act(() => {
			result.current.makeRequest();
		});
		expect(result.current.loading).toBeTruthy();
	});

	it('should set data and isSuccess when request is successful', async () => {
		const {result, waitForNextUpdate} = renderHook(() =>
			useApi({
				url: '/api/auth/reset-password',
				method: 'PATCH',
				data: {newPassword: '123456789', confirmPassword: '123456789'},
			}),
		);
		let success;
		act(() => {
			result.current.makeRequest().then((successValue) => {
				success = successValue;
			});
		});
		await waitForNextUpdate();
		expect(success).toBeTruthy();
		expect(result.current.data).toEqual({
			message:
				'Your password has been successfully reset. You can now sign in with your new password.',
		});
		expect(result.current.isSuccess).toBeTruthy();
		expect(result.current.errorMsg).toBeNull();
	});

	it('should set errorMsg when request fails', async () => {
		const {result, waitForNextUpdate} = renderHook(() =>
			useApi({
				url: '/api/auth/reset-password',
				method: 'PATCH',
				data: {newPassword: '123456789', confirmPassword: 'differentPassword'},
			}),
		);
		let success = false;
		act(() => {
			result.current.makeRequest().then((successValue) => {
				success = successValue;
			});
		});
		await waitForNextUpdate();
		expect(success).toBeFalsy();
		expect(result.current.errorMsg).toBe(
			'Password and confirm password do not match',
		);
		expect(result.current.isSuccess).toBeFalsy();
		expect(result.current.data).toBeNull();
	});

	it('should set errorMsg for network error', async () => {
		const {result, waitForNextUpdate} = renderHook(() =>
			useApi({
				url: '/api/auth/reset-password',
				method: 'PATCH',
				data: {
					newPassword: 'network@123',
					confirmPassword: 'network@123',
				},
			}),
		);
		let success = false;
		act(() => {
			result.current.makeRequest().then((successValue) => {
				success = successValue;
			});
		});
		await waitForNextUpdate();
		expect(success).toBeFalsy();
		expect(result.current.errorMsg).toBe('Network Error');
		expect(result.current.isSuccess).toBeFalsy();
		expect(result.current.data).toBeNull();
		expect(result.current.loading).toBeFalsy();
	});
});
