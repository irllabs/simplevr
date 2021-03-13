import {
    SET_CURRENT_ROOM,
    SET_IS_SHOWING_SIGNIN_DIALOG,
    SET_PUBLIC_STORIES,
    SET_STORY,
    SET_USER,
    SET_USER_DISPLAYNAME,
    SET_USER_STORIES,
    ADD_HOTSPOT,
    ADD_ROOM,
    SET_HOTSPOT_LOCATION,
    ADD_DOOR,
} from './actionTypes';

// User
export const setUser = (value) => {
    return {
        type: SET_USER,
        payload: {
            value: value,
        },
    };
};
export const setUserDisplayName = (value) => {
    return {
        type: SET_USER_DISPLAYNAME,
        payload: {
            value: value,
        },
    };
};

// User stories
export const setUserStories = (value) => {
    return {
        type: SET_USER_STORIES,
        payload: {
            value: value,
        },
    };
};

// Public stories
export const setPublicStories = (value) => {
    return {
        type: SET_PUBLIC_STORIES,
        payload: {
            value: value,
        },
    };
};

// Display
export const setIsShowingSignInDialog = (value) => {
    return {
        type: SET_IS_SHOWING_SIGNIN_DIALOG,
        payload: {
            value: value,
        },
    };
};

// Story
export const setStory = (value) => {
    return {
        type: SET_STORY,
        payload: {
            value: value,
        },
    };
};
export const setCurrentRoom = (value) => {
    return {
        type: SET_CURRENT_ROOM,
        payload: {
            value: value,
        },
    };
};
export const addHotspot = (hotspot, roomId) => {
    return {
        type: ADD_HOTSPOT,
        payload: {
            hotspot: hotspot,
            roomId: roomId,
        },
    };
};
export const addDoor = (door, roomId) => {
    return {
        type: ADD_DOOR,
        payload: {
            door: door,
            roomId: roomId,
        },
    };
};
export const addRoom = (room) => {
    return {
        type: ADD_ROOM,
        payload: {
            room: room,
        },
    };
};
export const updateHotspot = (hotspot) => {
    return {
        type: SET_HOTSPOT_LOCATION,
        payload: {
            hotspot: hotspot,
        },
    };
};
