import { combineReducers } from 'redux';

import user from './user';
import display from './display';
import userStories from './user-stories';
import publicStories from './public-stories';
import project from './project';
import User from '../../models/user';
import Story from '../../models/story';
import Project from '../../models/project';

export interface RootState {
    user: User;
    display: {
        isShowingSignInDialog: boolean;
    };
    userStories: Story[];
    publicStories: Story[];
    project: Project;
}

export default combineReducers<RootState>({
    user: user,
    display: display,
    userStories: userStories,
    publicStories: publicStories,
    project: project,
});
