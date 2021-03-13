import update from 'immutability-helper';

import {
    SET_STORY,
    SET_CURRENT_ROOM,
    ADD_HOTSPOT,
    ADD_ROOM,
    SET_HOTSPOT_LOCATION,
    ADD_DOOR,
} from '../actionTypes';

const initialState = null;

export default function storyReducer(state = initialState, action) {
    switch (action.type) {
    case SET_STORY: {
        return update(state, {
            $set: action.payload.value,
        });
    }
    case SET_CURRENT_ROOM: {
        return update(state, {
            currentRoom: {
                $set: action.payload.value,
            },
        });
    }
    case ADD_HOTSPOT: {
        return update(state, {
            rooms: {
                $set: state.rooms.map((room) => {
                    if (room.id === action.payload.roomId) {
                        room.hotspots.push(action.payload.hotspot);
                    }

                    return room;
                }),
            },
        });
    }
    case ADD_DOOR: {
        return update(state, {
            rooms: {
                $set: state.rooms.map((room) => {
                    if (room.id === action.payload.roomId) {
                        room.doors.push(action.payload.door);
                    }

                    return room;
                }),
            },
        });
    }
    case ADD_ROOM: {
        return update(state, {
            rooms: {
                $push: [action.payload.room],
            },
        });
    }
    case SET_HOTSPOT_LOCATION: {
        return update(state, {
            rooms: {
                hotspots: state.rooms.hotspots((hotspot) => {
                    if (hotspot.id === action.payload.hotspot.id) {
                        return {
                            ...hotspot,
                            ...action.payload.hotspot,
                        };
                    }

                    return hotspot;
                }),
            },
        });
    }
    default:
        return state;
    }
}
