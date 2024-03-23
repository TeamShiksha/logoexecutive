import styles from './Button.module.css';

/**
 * @param {React.HTMLProps & { lefIcon?: React.Component, rightIcon?: React.Component, isLoading?: boolean }} props
 **/
export default function Button({className, ...props}) {
	return (
		<button
			className={`${styles.Button} ${className}`}
			disabled={props.isLoading || props.disabled}
			{...props}
		>
			{props.lefIcon && props.lefIcon}
			{props.children}
			{props.rightIcon && props.rightIcon}
		</button>
	);
}
