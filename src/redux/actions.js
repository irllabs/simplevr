import {
    SET_IS_SHOWING_SIGNIN_DIALOG,
    SET_PUBLIC_STORIES,
    SET_USER,
    SET_USER_DISPLAYNAME,
    SET_USER_STORIES,

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

// User story
export const setUserStories = (value) => ({
    type: SET_USER_STORIES,
    payload: { value }
});
export const setPublicStories = (value) => ({
    type: SET_PUBLIC_STORIES,
    payload: { value }
});

// Display
export const setIsShowingSignInDialog = (value) => ({
    type: SET_IS_SHOWING_SIGNIN_DIALOG,
    payload: { value }
})
