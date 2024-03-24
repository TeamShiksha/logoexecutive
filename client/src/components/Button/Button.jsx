import styles from './Button.module.css';

/**
 * @param {React.HTMLProps & { leftIcon?: React.Component, rightIcon?: React.Component, isLoading?: boolean }} props
 **/
export default function Button({
	className,
	leftIcon,
	rightIcon,
	isLoading,
	...props
}) {
	return (
		<button
			className={`${styles.Button} ${className}`}
			disabled={isLoading || props.disabled}
			{...props}
		>
			{leftIcon && leftIcon}
			{props.children}
			{rightIcon && rightIcon}
		</button>
	);
}
