import update from 'immutability-helper';

import {
    SET_STORY,
    SET_CURRENT_ROOM,
    ADD_HOTSPOT,
    ADD_ROOM,
    SET_HOTSPOT_LOCATION,
    ADD_DOOR,
    SET_STORY_NAME,
    SET_STORY_TAGS,
    SET_STORY_SOUNDTRACK,
    SET_PROJECT,
} from '../actionTypes';

const initialState = null;

export default function projectReducer(state = initialState, action) {
    switch (action.type) {
    case SET_PROJECT: {
        return update(state, {
            $set: action.payload.project,
        });
    }
    case SET_STORY: {
        return update(state, {
            story: {
                $set: action.payload.value,
            },
        });
    }
    case SET_CURRENT_ROOM: {
        return update(state, {
            story: {
                currentRoom: {
                    $set: action.payload.value,
                },
            },
        });
    }
    case ADD_HOTSPOT: {
        return update(state, {
            story: {
                rooms: {
                    $set: state.rooms.map((room) => {
                        if (room.id === action.payload.roomId) {
                            room.hotspots.push(action.payload.hotspot);
                        }

                        return room;
                    }),
                },
            },
        });
    }
    case ADD_DOOR: {
        return update(state, {
            story: {
                rooms: {
                    $set: state.rooms.map((room) => {
                        if (room.id === action.payload.roomId) {
                            room.doors.push(action.payload.door);
                        }

                        return room;
                    }),
                },
            },
        });
    }
    case ADD_ROOM: {
        return update(state, {
            story: {
                rooms: {
                    $push: [action.payload.room],
                },
            },
        });
    }
    case SET_HOTSPOT_LOCATION: {
        return update(state, {
            story: {
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
            },
        });
    }
    case SET_STORY_NAME: {
        return update(state, {
            story: {
                name: {
                    $set: action.payload.name,
                },
            },
        });
    }
    case SET_STORY_TAGS: {
        return update(state, {
            story: {
                tags: {
                    $set: action.payload.tags,
                },
            },
        });
    }
    case SET_STORY_SOUNDTRACK: {
        return update(state, {
            story: {
                soundtrack: {
                    $set: action.payload.soundtrack,
                },
            },
        });
    }
    default:
        return state;
    }
}
