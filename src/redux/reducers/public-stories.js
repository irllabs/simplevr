import update from 'immutability-helper';

import { REMOVE_PUBLIC_STORY, SET_PUBLIC_STORIES } from '../actionTypes';

const initialState = [];

export default function publicStoriesReducer(state = initialState, action) {
    switch (action.type) {
    case SET_PUBLIC_STORIES: {
        return update(state, {
            $set: action.payload.value,
        });
    }
    case REMOVE_PUBLIC_STORY: {
        return update(state, {
            $set: state.filter((story) => {
                return story.id !== action.payload.storyId
            })
        })
    }
    default:
        return state;
    }
}
