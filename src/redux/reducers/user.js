import update from 'immutability-helper';

import { SET_USER, CLEAR_USER, SET_USER_DISPLAYNAME } from '../actionTypes';

const initialState = null;

export default function userReducer(state = initialState, action) {
    switch (action.type) {
    case SET_USER: {
        return update(state, {
            $set: action.payload.value,
        });
    }
    case SET_USER_DISPLAYNAME: {
        return update(state, {
            displayName: {
                $set: action.payload.value,
            },
        });
    }
    case CLEAR_USER: {
        return update(state, {
            $set: initialState,
        });
    }
    default:
        return state;
    }
}
