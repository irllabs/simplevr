import update from 'immutability-helper';

import { SET_USERS } from '../actionTypes';

const initialState = [];

export default function userReducer(state = initialState, action) {
	switch (action.type) {
		case SET_USERS: {
			return update(state, {
				$set: action.payload.value,
			});
		}
		default:
			return state;
	}
}
