import PropTypes from 'prop-types';

const cleanPercentage = (percentage) => {
	const tooLow = !Number.isFinite(+percentage) || percentage < 0;
	const tooHigh = percentage > 100;
	return tooLow ? 0 : tooHigh ? 100 : +percentage;
};

const Circle = ({colour, pct, strokeWidth, fill}) => {
	const r = 70 - strokeWidth / 2;
	const circ = 2 * Math.PI * r;
	const strokePct = ((100 - pct) * circ) / 100;
	return (
		<circle
			r={r}
			cx={100}
			cy={100}
			fill={fill}
			stroke={strokePct !== circ ? colour : ''}
			strokeWidth={strokeWidth}
			strokeDasharray={circ}
			strokeDashoffset={pct ? strokePct : 0}
			strokeLinecap='round'
		></circle>
	);
};

Circle.propTypes = {
	colour: PropTypes.string.isRequired,
	fill: PropTypes.string.isRequired,
	pct: PropTypes.number.isRequired,
	strokeWidth: PropTypes.number.isRequired,
};

const Text = ({percentage, fontSize}) => {
	return (
		<text
			x='50%'
			y='50%'
			dominantBaseline='central'
			textAnchor='middle'
			fontSize={fontSize}
		>
			{percentage.toFixed(0)}%
		</text>
	);
};

Text.propTypes = {
	percentage: PropTypes.number.isRequired,
	fontSize: PropTypes.string.isRequired,
};

function PieGraph({percentage, colour, strokeWidth, fontSize, fill}) {
	const pct = cleanPercentage(percentage);
	return (
		<svg viewBox='0 0 200 200' preserveAspectRatio='xMidYMid meet'>
			<g transform={`rotate(-90 100 100)`}>
				<Circle colour={fill} strokeWidth={strokeWidth} pct={100} fill={fill} />
				<Circle
					colour={colour}
					pct={pct}
					strokeWidth={strokeWidth}
					fill='transparent'
				/>
			</g>
			<Text percentage={pct} fontSize={fontSize} />
		</svg>
	);
}

PieGraph.propTypes = {
	percentage: PropTypes.number.isRequired,
	colour: PropTypes.string.isRequired,
	fill: PropTypes.string.isRequired,
	strokeWidth: PropTypes.number,
	fontSize: PropTypes.string,
};

PieGraph.defaultProps = {
	strokeWidth: 12,
	fontSize: '1.5em',
};

export default PieGraph;
