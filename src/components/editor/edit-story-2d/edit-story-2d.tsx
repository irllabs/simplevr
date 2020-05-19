import React from 'react';

import sceneInteractor from 'core/scene/sceneInteractor';

import './edit-story-2d.scss';
import Fullscreen from '../fullscreen/fullscreen';
import StoryScroll from '../story-scroll/story-scroll';

export default class EditStory2d extends React.Component<{}, {}> {
	constructor(props: {}) {
		super(props);
	}

	public render() {
		return ([
			<img
				key='room-image'
				draggable={false}
				src={this.getBackgroundImage()}
				className="edit-story-2d-background"
			/>,
			<Fullscreen key='fullscreen-button' />,
			<StoryScroll key='story-scroll' />,
		]);
	}

	private getBackgroundImage() {
		const roomId = sceneInteractor.getActiveRoomId();
		const room = sceneInteractor.getRoomById(roomId);
		return room.getBackgroundImageBinaryData();
	}
}
