import { combineReducers } from "redux";

import user from './user';
import display from './display';
import userStories from './user-stories';
import publicStories from './public-stories';

export default combineReducers({
    user,
    display,
    userStories,
    publicStories,
});
