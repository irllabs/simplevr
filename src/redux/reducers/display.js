/* eslint-disable import/no-anonymous-default-export */
import {
    SET_IS_SHOWING_SIGNIN_DIALOG
} from "../actionTypes";
import update from 'immutability-helper';

const initialState = {
    isShowingSignInDialog: false
};

export default function (state = initialState, action) {
    switch (action.type) {
        case SET_IS_SHOWING_SIGNIN_DIALOG: {
            return update(state, {
                isShowingSignInDialog: { $set: action.payload.value }
            })
        }
        default:
            return state;
    }
}