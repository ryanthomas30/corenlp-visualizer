import corenlp from 'corenlp-request-wrapper';

/**
 *
 * @param {String} corpus
 * @param {Array} annotators
 */
export const corpusParse = (corpus, annotators) => new Promise((resolve, reject) => {
	let annString = '';
	annotators.forEach(annotator => {
		annString += `${annotator}, `;
	});
	annString = annString.slice(0, -2);
	corenlp.parse(
		corpus,
		9000,
		annString,
		'json',
		(err, parsedText) => {
			if (err) {
				reject(err);
			}
			console.log('Output: ', JSON.parse(parsedText).sentences[0]);
			resolve(JSON.parse(parsedText).sentences[0]);
		}
	);
});

const posMap = {
	ADJP: 'adjective phrase',
	ADVP: 'adverb phrase',
	CC: 'Coordinating conjunction',
	CD: 'Cardinal number',
	DT: 'Determiner',
	EX: 'Existential there',
	FW: 'Foreign word',
	IN: 'Preposition or subordinating conjunction',
	INTJ: 'interjection',
	JJ: 'Adjective',
	JJR: 'Adjective, comparative',
	JJS: 'Adjective, superlative',
	LS: 'List item marker',
	MD: 'Modal',
	NN: 'Noun, singular or mass',
	NNS: 'Noun, plural',
	NNP: 'Proper noun, singular',
	NNPS: 'Proper noun, plural',
	NP: 'Noun phrase',
	PDT: 'Predeterminer',
	POS: 'Possessive ending',
	PP: 'Prepositional phrase',
	PRP: 'Personal pronoun',
	PRP$: 'Possessive pronoun',
	PRT: 'particle',
	RB: 'Adverb',
	RBR: 'Adverb, comparative',
	RBS: 'Adverb, superlative',
	RP: 'Particle',
	S: 'Simple declarative clause',
	SBAR: 'subordinating conjunction',
	SYM: 'Symbol',
	TO: 'to',
	UH: 'Interjection',
	VB: 'Verb, base form',
	VBD: 'Verb, past tense',
	VBG: 'Verb, gerund or present participle',
	VBN: 'Verb, past participle',
	VBP: 'Verb, non-3rd person singular present',
	VBZ: 'Verb, 3rd person singular present',
	VP: 'Verb phrase',
	WDT: 'Wh-determiner',
	WHAVP: 'Wh-adverb Phrase',
	WHNP: 'Wh-noun Phrase',
	WHPP: 'Wh-prepositional Phrase',
	WP: 'Wh-pronoun',
	WP$: 'Possessive wh-pronoun',
	WRB: 'Wh-adverb',
	X: 'Unknown, uncertain, or unbracketable',
	'.': 'Punctuation mark, sentence closer',
	',': 'Punctuation mark, comma',
	':': 'Punctuation mark, colon',
	'(': 'Contextual separator, left paren',
	')': 'Contextual separator, right paren',

};

export const getPosDescription = (pos) => {
	return posMap[pos];
};
