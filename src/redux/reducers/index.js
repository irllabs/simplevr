import { combineReducers } from 'redux';

import user from './user';
import display from './display';
import userStories from './user-stories';
import publicStories from './public-stories';
import story from './story';

export default combineReducers({
    user: user,
    display: display,
    userStories: userStories,
    publicStories: publicStories,
    story: story,
});
