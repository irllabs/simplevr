import update from 'immutability-helper';

import { REMOVE_USER_STORY, SET_USER_STORIES } from '../actionTypes';

const initialState = [];

export default function userStoriesReducer(state = initialState, action) {
    switch (action.type) {
    case SET_USER_STORIES: {
        return update(state, {
            $set: action.payload.value,
        });
    }
    case REMOVE_USER_STORY: {
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
