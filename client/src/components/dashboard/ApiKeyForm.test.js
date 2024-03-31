import {render, fireEvent, screen} from '@testing-library/react';
import ApiKeyForm from './ApiKeyForm';

describe('ApiKeyForm', () => {
	it('renders correctly', () => {
		render(
			<ApiKeyForm
				inputValue=''
				setInputValue={() => {}}
				errorMessage=''
				setErrorMessage={() => {}}
				handleGenerateKey={() => {}}
			/>,
		);
		expect(
			screen.getByLabelText('Description For API Key'),
		).toBeInTheDocument();
		expect(screen.getByText('Generate Key')).toBeInTheDocument();
	});

	it('handles input value change', () => {
		const setInputValue = jest.fn();
		const setErrorMessage = jest.fn();
		render(
			<ApiKeyForm
				inputValue=''
				setInputValue={setInputValue}
				errorMessage=''
				setErrorMessage={setErrorMessage}
				handleGenerateKey={() => {}}
			/>,
		);
		fireEvent.change(screen.getByLabelText('Description For API Key'), {
			target: {value: 'New Value'},
		});
		expect(setInputValue).toHaveBeenCalledWith('New Value');
		expect(setErrorMessage).toHaveBeenCalled();
	});

	it('handles form submission', () => {
		const handleGenerateKey = jest.fn();
		render(
			<ApiKeyForm
				inputValue=''
				setInputValue={() => {}}
				errorMessage=''
				setErrorMessage={() => {}}
				handleGenerateKey={handleGenerateKey}
			/>,
		);
		fireEvent.click(screen.getByText('Generate Key'));
		expect(handleGenerateKey).toHaveBeenCalled();
	});
});
