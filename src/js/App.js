import React, { Component } from 'react';

import { Form, TextArea, Header, Search, Label, Button, Dimmer, Loader } from 'semantic-ui-react';

import FlexBox from './custom/FlexBox';
import MainHeader from './MainHeader';

import { corpusParse } from './corenlp';

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
		this.setState({ output: nlpOutput });
	}

	/* RENDER METHOD */
	render() {
		const { searchValue, selectedAnns, output, loading } = this.state;
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

		const constituencyData = output.parse;
		console.log('constituencyData:', constituencyData);

		return (
			<div style={{ height: window.innerHeight, backgroundColor: '#FAFAFA' }} >
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
				</div>
			</div>
		);
	}
}

export default App;

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

const thing = {
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

function parseConstituents(str) {
	const trimmedString = str.replace(/\n/g, '');
	const obj = {};
	let depth = -1;
	let currentWord = '';
	trimmedString.forEach(c => {
		switch (c) {
			case '(':
				depth++;
				break;
			case ')':
				depth--;
				break;
			case ' ':
				// obj.name = currentWord;
				currentWord = '';
				break;
			default:
				currentWord += c;
		}
	});
}
