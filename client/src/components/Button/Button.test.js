import {fireEvent, render, screen} from '@testing-library/react';
import Button from './Button';

describe('Button', () => {
	it('Renders', async () => {
		render(<Button>Click me</Button>);

		const button = screen.getByRole('button');

		expect(button).toBeInTheDocument();
		expect(button.textContent).toBe('Click me');
	});

	it('Should support custom classname', async () => {
		render(<Button className={`custom`}>Click me</Button>);

		const button = screen.getByRole('button');

		expect(button).toBeInTheDocument();
		expect(button.className).toContain('custom');
	});

	it('Disabled when isLoading is true', async () => {
		render(<Button isLoading={true}>Click me</Button>);

		const button = screen.getByRole('button');

		expect(button).toBeInTheDocument();
		expect(button).toBeDisabled();
	});

	it('Disabled when disabled is true', async () => {
		render(<Button disabled>Click me</Button>);

		const button = screen.getByRole('button');

		expect(button).toBeInTheDocument();
		expect(button).toBeDisabled();
	});

	it('Renders leftIcon if present', async () => {
		render(<Button leftIcon={<span>Left Icon </span>}>Click me</Button>);

		const button = screen.getByRole('button');
		const Icon = screen.getByText('Left Icon');

		expect(button).toBeInTheDocument();
		expect(button.textContent).toBe('Left Icon Click me');
		expect(Icon).toBeInTheDocument();
	});

	it('Renders rightIcon if present', async () => {
		render(<Button rightIcon={<span>Right Icon</span>}>Click me </Button>);

		const button = screen.getByRole('button');
		const Icon = screen.getByText('Right Icon');

		expect(button).toBeInTheDocument();
		expect(button.textContent).toBe('Click me Right Icon');
		expect(Icon).toBeInTheDocument();
	});

	it('Triggers onclick when clicked', async () => {
		const mockFn = jest.fn();
		render(<Button onClick={mockFn}>Click me</Button>);

		const button = screen.getByRole('button');
		fireEvent.click(button);

		expect(mockFn).toHaveBeenCalledTimes(1);
	});

	it('Triggers onSubmit when clicked inside a form', async () => {
		const mockFn = jest.fn();
		render(
			<form
				onSubmit={(e) => {
					e.preventDefault();
					mockFn();
				}}
			>
				<Button type='submit'>Click me</Button>
			</form>,
		);

		const button = screen.getByRole('button');
		fireEvent.click(button);

		expect(mockFn).toHaveBeenCalledTimes(1);
	});
});
