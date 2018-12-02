import React from 'react';
import Tree from 'react-d3-tree';

const containerStyles = {
	width: '100%',
	height: '50vh',
	backgroundColor: '#ffffff',
	borderRadius: '4px',
	boxShadow: '0 2px 4px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.12)'
};

const treeStyles = {
	nodes: {
		node: {
			circle: {
				stroke: 'transparent',
				fill: '#212121',
				strokeWidth: 1
			},
		},
		leafNode: {
			circle: {
				stroke: 'transparent',
				fill: '#d9d9d9',
				strokeWidth: 1
			},
		}
	}
};

export default class CenteredTree extends React.PureComponent {
	state = {}

	componentDidMount() {
		const dimensions = this.treeContainer.getBoundingClientRect();
		this.setState({
			translate: {
				x: dimensions.width / 2,
				y: dimensions.height / 2
			}
		});
	}

	render() {
		const { data } = this.props;
		return (
			<div style={containerStyles} ref={tc => this.treeContainer = tc}>
				<Tree
					data={data}
					translate={this.state.translate}
					orientation={'vertical'}
					styles={treeStyles}
					scaleExtent={{ min: 0.5, max: 1.5 }}
				/>
			</div>
		);
	}
}
