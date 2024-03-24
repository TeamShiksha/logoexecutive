import { getClassnames } from './styleUtils';

describe('test getClassnames', () => {
	test('returns an empty string when empty classObject is provided', () => {
		const result = getClassnames({});
		expect(result).toBe('');
	});

	test('returns a single class name when only one class is true', () => {
		const result = getClassnames({active: true});
		expect(result).toBe(' active');
	});

	test('returns multiple class names when multiple classes are true & false', () => {
		const result = getClassnames({
			active: true,
			large: true,
			primary: true,
			secondary: false,
		});
		expect(result).toBe(' active large primary');
	});
});
