const DropDownItem = ({option, handleClick, testId, tabIndex = 0}) => {
	return (
		<li
			className='menu-items'
			onClick={handleClick}
			data-testid={testId}
			tabIndex={tabIndex}
		>
			<div>{option}</div>
		</li>
	);
};

export default DropDownItem;
