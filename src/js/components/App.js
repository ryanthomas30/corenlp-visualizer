import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Form, TextArea, Header, Search, Label, Button, Dimmer, Loader } from 'semantic-ui-react';
import Tree from 'react-d3-tree';

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

const myTreeData = [
	{
		name: 'Top Level',
		children: [
			{
				name: 'Level 2: A',
			},
			{
				name: 'Level 2: B',
			},
		],
	},
];

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
		console.log('treeData: ', JSON.stringify(myTreeData));
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

		const tree = parseData ? <CenteredTree data={[parseData]} /> : null;

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
				</div>
			</div>
		);
	}
}

App.defaultProps = {
	parseData: undefined
};

const mapStateToProps = (state) => ({
	parseData: state.data.parseData
});

export default connect(mapStateToProps, actions)(App);

/*
	(ROOT
		(NP
			(NP
				(NNP
					Bob
				)
				(NN
					pet
				)
			)
			(NP
				(DT
					a
				)
				(NN
					dog
				)
			)
			(.
				.
			)
		)
	)
*/

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
