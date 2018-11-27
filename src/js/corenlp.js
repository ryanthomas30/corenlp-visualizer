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
