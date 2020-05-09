import React from 'react';

import WelcomeMessage from 'components/welcome-message/welcome-message';
import Editor from 'components/editor/editor';

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
			<div className='app-container'>
				{this.state.storyOpen
				? <Editor />
				: <WelcomeMessage onStoryLoaded={this.onStoryLoaded} />}
			</div>
		);
	}

	private onStoryLoaded() {
		this.setState({
			storyOpen: true,
		});
	}
}
