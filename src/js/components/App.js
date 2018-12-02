import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Form, TextArea, Header, Search, Label, Button, Dimmer, Loader } from 'semantic-ui-react';
import { ArcherContainer, ArcherElement } from 'react-archer';

import FlexBox from './custom/FlexBox';
import MainHeader from './MainHeader';
import CenteredTree from './CenteredTree';

import { corpusParse } from './corenlp';
import * as actions from '../actions';

// corpusParse('Bob pet the dog', ['pos', 'lemma', 'parse', 'depparse']);

const styles = {
	mainContent: {
		margin: '48px',
		marginTop: '12px',
		padding: '48px',
		paddingTop: '12px'
	},
	label: {
		userSelect: 'none',
		cursor: 'pointer'
	}
};

const annotations = [
	{
		name: 'Constituency Parse',
		label: 'parse'
	},
	{
		name: 'Dependency Parse',
		label: 'depparse'
	},
	{
		name: 'Lemmas',
		label: 'lemma'
	},
	{
		name: 'Parts of Speech',
		label: 'pos'
	},
];

const boxStyle = {
	padding: '10px',
	backgroundColor: '#ffffff',
	borderRadius: '4px',
	boxShadow: '0 2px 4px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.12)',
	marginRight: '36px',
	marginLeft: '36px'
};

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

class App extends Component {
	constructor(props) {
		super(props);

		this._onInputChange = this._onInputChange.bind(this);
		this._onSearchChange = this._onSearchChange.bind(this);
		this._selectAnnotation = this._selectAnnotation.bind(this);
		this._run = this._run.bind(this);

		this.state = { corpus: '', searchValue: '', selectedAnns: new Set([]), output: {}, loading: false };
	}

	_onInputChange(e) {
		this.setState({ corpus: e.target.value });
	}

	_onSearchChange(e) {
		this.setState({ searchValue: e.target.value });
	}

	/* Selects/Deselects annotation */
	_selectAnnotation(annotation) {
		const { selectedAnns } = this.state;
		const updatedAnns = new Set([...selectedAnns]);
		const selected = selectedAnns.has(annotation.label);
		if (selected) {
			updatedAnns.delete(annotation.label);
		} else {
			updatedAnns.add(annotation.label);
		}
		this.setState({ selectedAnns: updatedAnns });
	}

	/* Runs CoreNLP with the provided corpus and annotations */
	async _run() {
		const { corpus, selectedAnns } = this.state;
		console.log('corpus:', corpus);
		console.log('selectedAnns:', [...selectedAnns]);
		let nlpOutput = {};
		try {
			this.setState({ loading: true });
			nlpOutput = await corpusParse(corpus, [...selectedAnns]);
			this.setState({ loading: false });
		} catch (err) {
			console.log(err);
		}
		this.setState({ output: nlpOutput }, () => {
			this.props.processParseData(this.state.output.parse);
		});
	}

	/* RENDER METHOD */
	render() {
		const { searchValue, selectedAnns, loading } = this.state;
		const { parseData } = this.props;
		console.log('parseData:', JSON.stringify(parseData));
		// Filter in annotations that are either selected or being searched
		const filteredAnnotations = annotations.filter(ann => {
			const selected = selectedAnns.has(ann.label);
			return ann.name.toLowerCase().includes(searchValue.toLowerCase()) || selected;
		});

		/* Render selectable tags for annotations */
		const Tags = () => {
			return filteredAnnotations.map(ann => {
				const selected = selectedAnns.has(ann.label);
				return (
					<Label style={styles.label} key={ann.label} color={selected ? 'blue' : ''} onClick={() => this._selectAnnotation(ann)} >
						{ann.name}
					</Label>
				);
			});
		};

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

		const generateMatrix = (parseData) => {
			const archerRows = [
				<ArcherElement
					id={parseData.id}
					relations={rootRelations}
				>
					<div style={boxStyle} >{parseData.name}</div>
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
						isLeaf = false;
					}
					return (
						<ArcherElement
							id={child.id}
							relations={relations}
						>
							<div style={boxStyle} >{child.name}</div>
						</ArcherElement>
					);
				});
				const effectiveDepth = isLeaf ? treeDepth : depth;
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

		const tree = null;
		let renderArcher = () => null;
		if (parseData.children && selectedAnns.has('parse')) {
			/* Wrap rows in divs; Prepare for rendering */
			renderArcher = () => generateMatrix(parseData).map((row, i) => {
				console.log('Hey');
				return (
					<FlexBox marginTop={96} direction='row' align='center' justify='center' >
						{row}
					</FlexBox>
				);
			});

			/* Original d3 Tree */
			// tree = <CenteredTree data={[parseData]} />;
		}

		return (
			<div style={{ minHeight: window.innerHeight, backgroundColor: '#FAFAFA' }} >
				<MainHeader />
				<div style={styles.mainContent} >
					<Dimmer active={loading} inverted>
						<Loader active={loading} size='large'>Loading</Loader>
					</Dimmer>
					<Header as='h1' >
						Corpus
					</Header>
					<Form>
						<TextArea autoHeight onChange={(e) => this._onInputChange(e)} />
					</Form>
					<Header as='h1' >
						Annotations
					</Header>
					<FlexBox marginBottom='small' align='start' >
						<Search showNoResults={false} onSearchChange={(e) => this._onSearchChange(e)} />
					</FlexBox>
					<FlexBox marginBottom='small' direction='row' >
						<Tags />
					</FlexBox>
					<Button primary onClick={() => this._run()} disabled={selectedAnns.size === 0} >
						Run
					</Button>
					<FlexBox marginTop='medium' >
						{tree}
					</FlexBox>
					<ArcherContainer strokeColor='#808080' >
						{renderArcher()}
					</ArcherContainer>
				</div>
			</div>
		);
	}
}

App.defaultProps = {
	parseData: {}
};

const mapStateToProps = (state) => ({
	parseData: state.data.parseData
});

export default connect(mapStateToProps, actions)(App);

const parseMockData = {
	name: 'ROOT',
	children: [
		{
			name: 'NP',
			children: [
				{
					name: 'NP',
					children: [
						{
							name: 'NNP',
							children: [
								{
									name: 'Bob',
									children: null
								}
							]
						},
						{
							name: 'NN',
							children: [
								{
									name: 'pet',
									children: null
								}
							]
						}
					]
				},
				{
					name: 'NP',
					children: [
						{
							name: 'DT',
							children: [
								{
									name: 'a',
									children: null
								}
							]
						},
						{
							name: 'NN',
							children: [
								{
									name: 'dog',
									children: null
								}
							]
						}
					]
				},
				{
					name: '.',
					children: [
						{
							name: '.',
							children: null
						}
					]
				}
			]
		}
	]
};
