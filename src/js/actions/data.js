import { POST_DATA } from '.';
import axios from 'axios';

const SERVER_ROOT = 'http://127.0.0.1:5000';

export const processParseData = (parseString) => async (dispatch) => {
	const response = await axios.post(`${SERVER_ROOT}/parse`, { parseString });
	dispatch({
		type: POST_DATA,
		payload: response.data
	});
};
