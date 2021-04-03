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
    UPDATE_DOOR,
    SET_ROOM_NAME,
    SET_ROOM_BACKGROUND,
    SET_HOTSPOT_NAME,
    SET_HOTSPOT_TEXT,
    SET_HOTSPOT_IMAGE,
    SET_HOTSPOT_AUDIO,
    SET_ROOM_BACKGROUND_MUSIC,
    SET_ROOM_BACKGROUND_NARRATION,
    SET_ROOM_IS_HOME,
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
                rooms: {
                    $set: state.story.rooms.map((room) => {
                        if (room.id !== action.payload.room.id) {
                            return {
                                ...room,
                                active: false,
                            };
                        }

                        return {
                            ...room,
                            active: true,
                        };
                    }),
                },
                roomHistory: {
                    $push: [action.payload.room.id],
                }
            },
        });
    }
    case ADD_HOTSPOT: {
        return update(state, {
            story: {
                rooms: {
                    $set: state.story.rooms.map((room) => {
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
                    $set: state.story.rooms.map((room) => {
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
                    hotspots: state.story.rooms.hotspots((hotspot) => {
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
    case UPDATE_DOOR: {
        const currentRoom = state.story.getActiveRoom();

        const doorRoom = state.story.rooms.find((room) => {
            return room.id === currentRoom.id;
        });

        return update(state, {
            story: {
                rooms: {
                    doors: {
                        $set: doorRoom.doors.map((door) => {
                            if (door.id === action.payload.door.id) {
                                return {
                                    ...door,
                                    ...action.payload.door,
                                };
                            }

                            return door;
                        }),
                    },
                },
            },
        });
    }
    case SET_ROOM_NAME: {
        return update(state, {
            story: {
                rooms: {
                    $set: state.story.rooms.map((room) => {
                        if (room.id !== action.payload.roomId) {
                            return room;
                        }

                        return {
                            ...room,
                            name: action.payload.name,
                        };
                    }),
                },
            },
        });
    }
    case SET_ROOM_IS_HOME: {
        return update(state, {
            story: {
                rooms: {
                    $set: state.story.rooms.map((room) => {
                        if (room.id !== action.payload.roomId) {
                            return {
                                ...room,
                                isHome: false,
                            };
                        }

                        return {
                            ...room,
                            isHome: action.payload.isHome,
                        };
                    }),
                },
            },
        });
    }
    case SET_ROOM_BACKGROUND: {
        const currentRoom = state.story.getActiveRoom();

        return update(state, {
            story: {
                rooms: {
                    $set: state.story.rooms.map((room) => {
                        if (room.id !== currentRoom.id) {
                            return room;
                        }

                        return {
                            ...room,
                            panoramaUrl: {
                                ...room.panoramaUrl,
                                backgroundImage: {
                                    ...room.panoramaUrl.backgroundImage,
                                    data: action.payload.background,
                                },
                                thumbnail: {
                                    ...room.panoramaUrl.thumbnail,
                                    data: action.payload.thumbnail,
                                },
                            },
                        };
                    }),
                },
            },
        });
    }
    case SET_ROOM_BACKGROUND_MUSIC: {
        return update(state, {
            story: {
                rooms: {
                    $set: state.story.rooms.map((room) => {
                        if (room.id !== action.payload.roomId) {
                            return room;
                        }

                        return {
                            ...room,
                            backgroundMusic: {
                                ...room.backgroundMusic,
                                data: action.payload.data,
                                fileName: action.payload.name,
                                extension: action.payload.extension,
                                loop: action.payload.loop,
                                volume: action.payload.volume
                            },
                        };
                    }),
                },
            },
        });
    }
    case SET_ROOM_BACKGROUND_NARRATION: {
        return update(state, {
            story: {
                rooms: {
                    $set: state.story.rooms.map((room) => {
                        if (room.id !== action.payload.roomId) {
                            return room;
                        }

                        return {
                            ...room,
                            backgroundNarration: {
                                ...room.backgroundNarration,
                                data: action.payload.data,
                                fileName: action.payload.name,
                                extension: action.payload.extension,
                                loop: action.payload.loop,
                                volume: action.payload.volume
                            },
                        };
                    }),
                },
            },
        });
    }
    case SET_HOTSPOT_NAME: {
        const currentRoom = state.story.getActiveRoom();
        const currentRoomIndex = state.story.rooms.indexOf(currentRoom);

        return update(state, {
            story: {
                rooms: {
                    [currentRoomIndex]: {
                        hotspots: {
                            $set: currentRoom.hotspots.map((hotspot) => {
                                if (hotspot.id !== action.payload.hotspotId) {
                                    return hotspot;
                                }

                                return {
                                    ...hotspot,
                                    label: action.payload.name,
                                };
                            }),
                        },
                    },
                },
            },
        });
    }
    case SET_HOTSPOT_TEXT: {
        const currentRoom = state.story.getActiveRoom();
        const currentRoomIndex = state.story.rooms.indexOf(currentRoom);

        return update(state, {
            story: {
                rooms: {
                    [currentRoomIndex]: {
                        hotspots: {
                            $set: currentRoom.hotspots.map((hotspot) => {
                                if (hotspot.id !== action.payload.hotspotId) {
                                    return hotspot;
                                }

                                return {
                                    ...hotspot,
                                    text: action.payload.text,
                                };
                            }),
                        },
                    },
                },
            },
        });
    }
    case SET_HOTSPOT_IMAGE: {
        const currentRoom = state.story.getActiveRoom();
        const currentRoomIndex = state.story.rooms.indexOf(currentRoom);

        return update(state, {
            story: {
                rooms: {
                    [currentRoomIndex]: {
                        hotspots: {
                            $set: currentRoom.hotspots.map((hotspot) => {
                                if (hotspot.id !== action.payload.hotspotId) {
                                    return hotspot;
                                }

                                return {
                                    ...hotspot,
                                    image: {
                                        ...hotspot.image,
                                        extension: action.payload.extension,
                                        data: action.payload.imageData,
                                    },
                                };
                            }),
                        },
                    },
                },
            },
        });
    }
    case SET_HOTSPOT_AUDIO: {
        const currentRoom = state.story.getActiveRoom();
        const currentRoomIndex = state.story.rooms.indexOf(currentRoom);

        return update(state, {
            story: {
                rooms: {
                    [currentRoomIndex]: {
                        hotspots: {
                            $set: currentRoom.hotspots.map((hotspot) => {
                                if (hotspot.id !== action.payload.hotspotId) {
                                    return hotspot;
                                }

                                return {
                                    ...hotspot,
                                    audio: {
                                        ...hotspot.audio,
                                        fileName: action.payload.name,
                                        extension: action.payload.extension,
                                        data: action.payload.data,
                                        loop: action.payload.loop,
                                        volume: action.payload.volume
                                    },
                                };
                            }),
                        },
                    },
                },
            },
        });
    }
    default:
        return state;
    }
}
