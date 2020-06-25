import React from 'react';

import Spacer from 'root/irl-ui/spacer/spacer';

import Topbar from './topbar/topbar';
import NewStory from './new-story/new-story';
import UserStories from './user-stories/user-stories';

import './app.scss';
import PublicStories from './public-stories/public-stories';

export default class App extends React.Component<{}, {}> {
	constructor(props: {}) {
		super(props);

		this.state = {
			storyOpen: false,
			preview: false,
		}
	}

	public componentDidMount() {
		
	}

	public render() {
		return ([
			<Topbar key='topbar' />,
			<NewStory key='new-story' />,
			<Spacer key='spacer-new-story-user-stories' size={48} />,
			<UserStories key='user-stories' />,
			<PublicStories key='public-stories' />
		]);
	}
}
