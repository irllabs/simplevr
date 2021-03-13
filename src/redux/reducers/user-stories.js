import update from 'immutability-helper';

import { SET_USER_STORIES } from '../actionTypes';

const initialState = [];

export default function userStoriesReducer(state = initialState, action) {
    switch (action.type) {
    case SET_USER_STORIES: {
        return update(state, {
            $set: action.payload.value,
        });
    }
    default:
        return state;
    }
}
