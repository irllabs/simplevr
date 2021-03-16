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
    SET_STORY_NAME,
    SET_STORY_TAGS,
    SET_STORY_SOUNDTRACK,
    SET_PROJECT,
    UPDATE_DOOR,
    SET_ROOM_NAME,
    SET_ROOM_BACKGROUND,
    SET_HOTSPOT_NAME,
    SET_HOTSPOT_TEXT,
    SET_HOTSPOT_IMAGE,
    SET_HOTSPOT_AUDIO,
    SET_ROOM_BACKGROUND_MUSIC,
    SET_ROOM_BACKGROUND_NARRATION,
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

// Project
export const setProject = (project) => {
    return {
        type: SET_PROJECT,
        payload: {
            project: project,
        },
    };
};
export const setStory = (value) => {
    return {
        type: SET_STORY,
        payload: {
            value: value,
        },
    };
};
export const setCurrentRoom = (room) => {
    return {
        type: SET_CURRENT_ROOM,
        payload: {
            room: room,
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
export const setStoryName = (name) => {
    return {
        type: SET_STORY_NAME,
        payload: {
            name: name,
        },
    };
};
export const setStoryTags = (tags) => {
    return {
        type: SET_STORY_TAGS,
        payload: {
            tags: tags,
        },
    };
};
export const setStorySoundtrack = (soundtrack) => {
    return {
        type: SET_STORY_SOUNDTRACK,
        payload: {
            soundtrack: soundtrack,
        },
    };
};
export const updateDoor = (door) => {
    return {
        type: UPDATE_DOOR,
        payload: {
            door: door,
        },
    };
};
export const setRoomName = (roomId, name) => {
    return {
        type: SET_ROOM_NAME,
        payload: {
            roomId: roomId,
            name: name,
        },
    };
};
export const setRoomBackground = (roomId, background, thumbnail) => {
    return {
        type: SET_ROOM_BACKGROUND,
        payload: {
            roomId: roomId,
            background: background,
            thumbnail: thumbnail,
        },
    };
};
export const setHotspotName = (hotspotId, name) => {
    return {
        type: SET_HOTSPOT_NAME,
        payload: {
            hotspotId: hotspotId,
            name: name,
        },
    };
};
export const setHotspotText = (hotspotId, text) => {
    return {
        type: SET_HOTSPOT_TEXT,
        payload: {
            hotspotId: hotspotId,
            text: text,
        },
    };
};
export const setHotspotImage = (hotspotId, imageData, extension) => {
    return {
        type: SET_HOTSPOT_IMAGE,
        payload: {
            hotspotId: hotspotId,
            imageData: imageData,
            extension: extension,
        },
    };
};
export const setHotspotAudio = (hotspotId, data, extension) => {
    return {
        type: SET_HOTSPOT_AUDIO,
        payload: {
            hotspotId: hotspotId,
            data: data,
            extension: extension,
        },
    };
};
export const setRoomBackgroundMusic = (roomId, data, extension) => {
    return {
        type: SET_ROOM_BACKGROUND_MUSIC,
        payload: {
            roomId: roomId,
            data: data,
            extension: extension,
        },
    };
};
export const setRoomBackgroundNarration = (roomId, data, extension) => {
    return {
        type: SET_ROOM_BACKGROUND_NARRATION,
        payload: {
            roomId: roomId,
            data: data,
            extension: extension,
        },
    };
};