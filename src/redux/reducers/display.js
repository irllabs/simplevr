import update from 'immutability-helper';

import { HIDE_SNACKBAR, SET_IS_SHOWING_SIGNIN_DIALOG, SHOW_SNACKBAR } from '../actionTypes';

const initialState = {
    isShowingSignInDialog: false,
    isShowingSnackbar: false,
    snackbarMessage: '',
};

export default function displayReducer(state = initialState, action) {
    switch (action.type) {
    case SET_IS_SHOWING_SIGNIN_DIALOG: {
        return update(state, {
            isShowingSignInDialog: { $set: action.payload.value },
        });
    }
    case SHOW_SNACKBAR: {
        return update(state, {
            isShowingSnackbar: { $set: true },
            snackbarMessage: {$set: action.payload.message }
        });
    }
    case HIDE_SNACKBAR: {
        return update(state, {
            isShowingSnackbar: { $set: false },
            snackbarMessage: { $set: '' }
        });
    }
    default:
        return state;
    }
}
