import React, { Component } from 'react';

import { ArcherContainer, ArcherElement } from 'react-archer';

import FlexBox from './custom/FlexBox';

import { getPosDescription } from './corenlp';

/* Get depth of tree */
const getDepth = (obj) => {
	let depth = 0;
	if (obj.children) {
		obj.children.forEach(function (d) {
			const tmpDepth = getDepth(d);
			if (tmpDepth > depth) {
				depth = tmpDepth;
			}
		});
	}
	return 1 + depth;
};

class ArcherTree extends Component {
	render() {
		const { parseData, visible, depParseData, hasDependencies } = this.props;
		if (!visible) return null;
		/* Convert tree to adjacency matrix */
		/* Array of all rows; Initialized with ROOT */
		let rootRelations = null;
		if (parseData.children) {
			rootRelations = parseData.children.map(child => (
				{
					from: { anchor: 'bottom' },
					to: { anchor: 'top', id: child.id }
				}
			));
		}
		const treeDepth = getDepth(parseData);
		/* Maps position of leaf in sentence to its ID generated in Flask server */
		const leafIdMap = [];

		const generateMatrix = (parseData) => {
			let leafIndex = 0;
			const archerRows = [
				<ArcherElement
					id={parseData.id}
					relations={rootRelations}
					className='archer-element'
				>
					<FlexBox justify='center' align='center' className='tree-node' >{parseData.name}</FlexBox>
				</ArcherElement>
			];
			/* Generates row React elements for the tree's immediate children */
			const generateMatrixHelper = (tree, depth = 1) => {
				let isLeaf = false;
				const rowElements = tree.children.map(child => {
					let relations = null;
					/* Map child to its children if they exist */
					/* Else is leaf */
					if (child.children) {
						relations = child.children.map(subChild => (
							{
								from: { anchor: 'bottom' },
								to: { anchor: 'top', id: subChild.id }
							}
						));
					} else {
						isLeaf = true;
						/* Map index of leaf to ID of word */
						leafIndex++;
						leafIdMap[leafIndex] = child.id;
					}
					const nodeStyle = isLeaf ? 'tree-node--leaf' : 'tree-node';
					return (
						<ArcherElement
							key={child.id}
							id={child.id}
							relations={relations}
							className='archer-element'
						>
							<FlexBox justify='center' align='center' className={nodeStyle} title={getPosDescription(child.name)} >
								{child.name}
							</FlexBox>
						</ArcherElement>
					);
				});
				const effectiveDepth = isLeaf && hasDependencies && depParseData ? treeDepth : depth;
				// const effectiveDepth = depth;
				/* Else If rowElements array at depth already exists, merge current rowElements with existing rowElements */
				/* Else push onto archerArray */
				if (archerRows[effectiveDepth]) {
					archerRows[effectiveDepth] = archerRows[effectiveDepth].concat(rowElements);
				} else {
					archerRows[effectiveDepth] = rowElements;
				}
				tree.children.forEach(child => {
					const newDepth = depth + 1;
					if (child.children) generateMatrixHelper(child, newDepth);
				});
			};
			if (parseData.children) generateMatrixHelper(parseData);
			return archerRows;
		};

		const generatedMatrix = generateMatrix(parseData);

		console.log('leafIdMap:', leafIdMap);
		/* Row for dependency parse data to append to generated matrix */
		if (depParseData && hasDependencies) {
			depParseData.shift();
			const depParseRow = depParseData.map((depElem, i) => {
				const anchorRight = depElem.governor - depElem.dependent > 0;
				const relations = [
					{
						from: { anchor: anchorRight ? 'right' : 'left' },
						to: { anchor: 'bottom', id: leafIdMap[depElem.governor] }
					},
					{
						from: { anchor: !anchorRight ? 'right' : 'left' },
						to: { anchor: 'bottom', id: leafIdMap[depElem.dependent] }
					}
				];

				return (
					<ArcherElement
						key={i}
						id={i}
						relations={relations}
						className='archer-element'
					>
						<FlexBox justify='center' align='center' className='tree-node--dep' >
							{depElem.dep}
						</FlexBox>
					</ArcherElement>
				);
			});
			generatedMatrix.push(depParseRow);
		}

		/* Wrap rows in divs; Prepare for rendering */
		const renderArcher = () => generatedMatrix.map((row, i) => {
			return (
				<FlexBox key={i} marginTop={96} direction='row' align='center' justify='center' >
					{row}
				</FlexBox>
			);
		});

		return (
			<ArcherContainer strokeColor='#808080' >
				{renderArcher()}
			</ArcherContainer>
		);
	}
}

export default ArcherTree;
