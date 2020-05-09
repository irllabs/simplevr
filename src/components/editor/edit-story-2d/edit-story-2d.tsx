import React from 'react';

import sceneInteractor from 'core/scene/sceneInteractor';

import './edit-story-2d.scss';

export default class EditStory2d extends React.Component<{}, {}> {
	constructor(props: {}) {
		super(props);
	}

	public render() {
		return (
			<img
				draggable={false}
				src={this.getBackgroundImage()}
				className="edit-story-2d-background"
			/>
		);
	}

	private getBackgroundImage() {
		const roomId = sceneInteractor.getActiveRoomId();
		const room = sceneInteractor.getRoomById(roomId);
		return room.getBackgroundImageBinaryData();
	}
}
