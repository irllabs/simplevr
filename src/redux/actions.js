import {
    SET_IS_SHOWING_SIGNIN_DIALOG,
    SET_USER,
    SET_USER_DISPLAYNAME,

} from './actionTypes'

// User
export const setUser = (value) => ({
    type: SET_USER,
    payload: { value }
})
export const setUserDisplayName = (value) => ({
    type: SET_USER_DISPLAYNAME,
    payload: { value }
})



// Display
export const setIsShowingSignInDialog = (value) => ({
    type: SET_IS_SHOWING_SIGNIN_DIALOG,
    payload: { value }
})
