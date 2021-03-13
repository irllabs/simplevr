import update from 'immutability-helper';

import { SET_IS_SHOWING_SIGNIN_DIALOG } from '../actionTypes';

const initialState = {
    isShowingSignInDialog: false,
};

export default function displayReducer(state = initialState, action) {
    switch (action.type) {
    case SET_IS_SHOWING_SIGNIN_DIALOG: {
        return update(state, {
            isShowingSignInDialog: { $set: action.payload.value },
        });
    }
    default:
        return state;
    }
}
