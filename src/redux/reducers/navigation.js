import update from 'immutability-helper';

import { SET_OPENED_PREVIEW_FROM_APPLICATION } from '../actionTypes';

const initialState = {
    viewOpenedFromApplication: false
};

export default function navigationReduces(state = initialState, action) {
    switch (action.type) {
    case SET_OPENED_PREVIEW_FROM_APPLICATION: {
        return update(state, {
            viewOpenedFromApplication: {
                $set: action.payload.value,
            }
        });
    }
    default:
        return state;
    }
}
