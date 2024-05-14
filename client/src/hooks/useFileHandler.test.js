import {renderHook, act} from '@testing-library/react-hooks';
import useFileHandler from './useFileHandler';

global.URL.createObjectURL = jest.fn();

describe('useFileHandler', () => {
	it('should return initial state', () => {
		const {result} = renderHook(() => useFileHandler());
		expect(result.current.file).toBeNull();
		expect(result.current.error).toBeNull();
	});

	it('should set error when file type is not valid', () => {
		const {result} = renderHook(() => useFileHandler(['jpg', 'png']));
		const file = new File(['hello'], 'hello.pdf', {type: 'application/pdf'});
		act(() => {
			result.current.handleFile(file);
		});
		expect(result.current.error).toBe(
			'Please select jpg,png file. You chose a pdf file.',
		);
		expect(result.current.file).toBeNull();
	});

	it('should set file when file type is valid', () => {
		const {result} = renderHook(() => useFileHandler(['jpg', 'png']));
		const mockCreateObjectURL = jest.fn(() => 'https://image.com/1.jpg');
		global.URL.createObjectURL = mockCreateObjectURL;
		const file = new File(['fileContent'], 'hello.jpg', {type: 'image/jpeg'});
		act(() => {
			result.current.handleFile(file);
		});
		expect(result.current.error).toBeNull();
		expect(result.current.file.name).toBe('hello.jpg');
		expect(result.current.file.url).toBeDefined();
	});

	it('should set error when file cannot be read', () => {
		const {result} = renderHook(() => useFileHandler(['jpg', 'png']));
		const file = new File(['hello'], 'hello.jpg', {type: 'image/jpeg'});
		const createObjectURLSpy = jest
			.spyOn(URL, 'createObjectURL')
			.mockImplementationOnce(() => {
				throw new Error('Cannot read file');
			});
		act(() => {
			result.current.handleFile(file);
		});
		expect(result.current.error).toBe(
			'An error occurred while reading the file.',
		);
		expect(result.current.file).toBeNull();
		createObjectURLSpy.mockRestore();
	});

	it('should set file when no valid formats are provided', () => {
		const {result} = renderHook(() => useFileHandler());
		const mockCreateObjectURL = jest.fn(() => 'https://image.com/1.jpg');
		global.URL.createObjectURL = mockCreateObjectURL;
		const file = new File(['hello'], 'hello.pdf', {type: 'application/pdf'});
		act(() => {
			result.current.handleFile(file);
		});
		expect(result.current.error).toBeNull();
		expect(result.current.file.name).toBe('hello.pdf');
		expect(result.current.file.url).toBeDefined();
	});
});
