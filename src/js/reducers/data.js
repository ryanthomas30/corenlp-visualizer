import { POST_DATA } from '../actions';

export default function (state = {}, action) {
	switch (action.type) {
		case POST_DATA:
			return { ...state, parseData: action.payload };
		default:
			return state;
	}
}
