import React from 'react';
import {
	BrowserRouter as Router,
	Switch,
	Route
} from "react-router-dom";
import uuid from 'uuid/v1';
import QueryString from 'query-string';

import WelcomeMessage from 'components/welcome-message/welcome-message';
import Editor from 'components/editor/editor';
import UserProfile from 'components/user-profile/user-profile';
import Story from 'components/story/story';
import Admin from 'components/admin/admin';
import HiddenFileLoader from 'components/hidden-file-loader/hidden-file-loader';
import Modal from 'components/modal/modal';

import openStoryEvent, { OpenStoryEventData } from 'root/events/open-story-event';

import './app.scss';
import { SHARED_KEY } from 'ui/editor/util/publicLinkHelper';
import shareableLoader from 'ui/common/shareable-loader';

interface AppState {
	storyOpen: boolean;
	preview: boolean;
}

export default class App extends React.Component<{}, AppState> {
	private _openStoryEventId = uuid();

	constructor(props: {}) {
		super(props);

		this.state = {
			storyOpen: false,
			preview: false,
		}

		this.onStoryLoaded = this.onStoryLoaded.bind(this);
		this.onPreviewToggle = this.onPreviewToggle.bind(this);
	}

	public componentDidMount() {
		openStoryEvent.subscribe({
			id: this._openStoryEventId,
			callback: this.onStoryLoaded,
		});

		const storyId = location.hash.split(`${SHARED_KEY}=`)[1];
		if (typeof storyId === 'string') {
			shareableLoader.openProject(storyId);
		}
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
							? <Editor preview={this.state.preview} onPreviewToggle={this.onPreviewToggle} />
							: <WelcomeMessage onStoryLoaded={this.onStoryLoaded} />}
						</div>
						{!this.state.preview && <UserProfile />}
						{!this.state.preview && <Story />}
						<HiddenFileLoader />
						<Modal />
					</Route>
				</Switch>
			</Router>
		);
	}

	private onPreviewToggle(enabled: boolean) {
		this.setState({
			preview: enabled,
		});
	}

	private onStoryLoaded(data?: OpenStoryEventData) {
		this.setState({
			storyOpen: true,
			preview: data?.preview,
		});
	}
}
