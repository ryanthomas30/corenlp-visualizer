import React, { Component } from 'react';

const mapping = {
	start: 'flex-start',
	end: 'flex-end',
	between: 'space-between',
	small: '12px',
	medium: '24px',
	large: '48px'
};

const wrapMap = (b) => {
	return b ? 'wrap' : 'nowrap';
};

const map = (input) => {
	if (input in mapping) {
		return mapping[input];
	}
	return input;
};

class FlexBox extends Component {
	render() {
		const { direction, justify, align, wrap } = this.props;
		let { padding, paddingLeft, paddingRight, paddingTop, paddingBottom,
			margin, marginLeft, marginRight, marginTop, marginBottom } = this.props;
		/* Sets defaults if prop is undefined */
		const flexDirection = map(direction);
		const justifyContent = map(justify);
		const alignItems = map(align);
		const	flexWrap = wrapMap(wrap);

		/* PADDING */
		padding = map(padding);
		paddingLeft = map(paddingLeft);
		paddingRight = map(paddingRight);
		paddingTop = map(paddingTop);
		paddingBottom = map(paddingBottom);

		/* MARGIN */
		const marginObj = { margin, marginLeft, marginRight, marginTop, marginBottom };
		Object.keys(marginObj).forEach(k => {
			marginObj[k] = typeof marginObj[k] === 'number' ? `${marginObj[k]}px` : map(marginObj[k]);
		});
		console.log('finalMargin:', marginObj);

		/* Merges props with style object */
		const finalStyling = {
			display: 'flex', flexDirection, justifyContent, alignItems, flexWrap,
			padding, paddingLeft, paddingRight, paddingTop, paddingBottom, ...marginObj, ...this.props.style };

		/* Delete undefined fields */
		Object.keys(finalStyling).forEach(key => finalStyling[key] === undefined && delete finalStyling[key]);
		console.log('finalStyling:', finalStyling);

		return (
			<div style={finalStyling}>
				{this.props.children}
			</div>
		);
	}
}

FlexBox.defaultProps = {
	direction: 'column',
	justify: 'start',
	align: 'center',
	wrap: 'wrap'
};

export default FlexBox;
