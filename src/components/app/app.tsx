import React from 'react';
import {
	BrowserRouter as Router,
	Switch,
	Route
} from "react-router-dom";

import WelcomeMessage from 'components/welcome-message/welcome-message';
import Editor from 'components/editor/editor';
import UserProfile from 'components/user-profile/user-profile';
import Story from 'components/story/story';
import Admin from 'components/admin/admin';

import './app.scss';

interface AppState {
	storyOpen: boolean;
}

export default class App extends React.Component<{}, AppState> {
	constructor(props: {}) {
		super(props);

		this.state = {
			storyOpen: false,
		}

		this.onStoryLoaded = this.onStoryLoaded.bind(this);
	}

	public render() {
		return (
			<Router>
				<Switch>
					<Route path='/admin'>
						<Admin />
					</Route>
					<Route path='/'>
						<div className='app-container'>
							{this.state.storyOpen
							? <Editor />
							: <WelcomeMessage onStoryLoaded={this.onStoryLoaded} />}
						</div>
						<UserProfile />
						<Story />
					</Route>
				</Switch>
			</Router>
		);
	}

	private onStoryLoaded() {
		this.setState({
			storyOpen: true,
		});
	}
}
