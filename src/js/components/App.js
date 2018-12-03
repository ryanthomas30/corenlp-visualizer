import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Form, TextArea, Header, Search, Label, Button, Dimmer, Loader } from 'semantic-ui-react';

import FlexBox from './custom/FlexBox';
import MainHeader from './MainHeader';
import ArcherTree from './ArcherTree';
import CenteredTree from './CenteredTree';

import { corpusParse } from './corenlp';
import * as actions from '../actions';

// corpusParse('Bob pet the dog', ['pos', 'lemma', 'parse', 'depparse']);

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
		const { searchValue, selectedAnns, loading, output } = this.state;
		const { parseData } = this.props;
		console.log('basicDependencies:', output.basicDependencies);
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
					<Label className='label' key={ann.label} color={selected ? 'blue' : ''} onClick={() => this._selectAnnotation(ann)} >
						{ann.name}
					</Label>
				);
			});
		};

		const tree = null;
		if (parseData.children && selectedAnns.has('parse')) {
			/* Original d3 Tree */
			// tree = <CenteredTree data={[parseData]} />;
		}

		return (
			<div className='app' >
				<MainHeader />
				<div className='main-content' >
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
					<ArcherTree parseData={parseData} depParseData={output.basicDependencies} visible={parseData.children && selectedAnns.has('parse')}
						hasDependencies={selectedAnns.has('depparse')} />
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
