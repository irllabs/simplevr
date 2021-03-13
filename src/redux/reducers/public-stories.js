import update from 'immutability-helper';

import { SET_PUBLIC_STORIES } from '../actionTypes';

const initialState = [];

export default function publicStoriesReducer(state = initialState, action) {
    switch (action.type) {
    case SET_PUBLIC_STORIES: {
        return update(state, {
            $set: action.payload.value,
        });
    }
    default:
        return state;
    }
}
