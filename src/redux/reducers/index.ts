import { combineReducers } from 'redux';

import user from './user';
import users from './users';
import display from './display';
import userStories from './user-stories';
import publicStories from './public-stories';
import project from './project';
import User from '../../models/user';
import Story from '../../models/story';
import Project from '../../models/project';
import navigation from './navigation';
import StorageProject from '../../models/storage/StorageProject';

export interface RootState {
    user: User;
	users: User[];
    display: {
        isShowingSignInDialog: boolean;
        isShowingSnackbar: boolean;
        snackbarMessage: string;
    };
    userStories: Story[];
    publicStories: StorageProject[];
    project: Project;
    navigation: {
        viewOpenedFromApplication: boolean
    };
}

export default combineReducers<RootState>({
    user: user,
	users: users,
    display: display,
    userStories: userStories,
    publicStories: publicStories,
    project: project,
    navigation: navigation,
});
