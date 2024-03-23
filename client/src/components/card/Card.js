/**
 * @param {React.HTMLProps & React.PropsWithChildren} props
 **/
export default function Card({children, ...props}) {
	return (
		<div
			style={{
				borderRadius: 'var(--bradius)',
				boxShadow: 'var(--shadow)',
				border: 'var(--border)',
				padding: '16px',
			}}
			{...props}
		>
			{children}
		</div>
	);
}
