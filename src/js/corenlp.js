import corenlp from 'corenlp-request-wrapper';

/**
 * 
 * @param {String} corpus 
 * @param {Array} annotators 
 */
export const corpusParse = (corpus, annotators) => {
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
			if (err) return err;
			console.log(JSON.parse(parsedText).sentences[0]);
			return JSON.parse(parsedText).sentences[0];
		}
	);
};