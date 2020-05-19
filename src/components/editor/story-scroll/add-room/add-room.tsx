import React from 'react';
import userInteractor from 'core/user/userInteractor';

import './add-room.scss';
import openModalEvent from 'root/events/open-modal-event';

import FileLoader from 'util/file-loader';
import resizeImageAsync from 'root/services/resize-image';
import sceneInteractor from 'core/scene/sceneInteractor';
import { Room } from 'data/scene/entities/room';

interface AddRoomProps {
	onRoomAdded: () => void;
}

export default class AddRoom extends React.Component<AddRoomProps, {}> {
	constructor(props: AddRoomProps) {
		super(props);

		this.addRoom = this.addRoom.bind(this);
		this.onInputClick = this.onInputClick.bind(this);
		this.onFileSelectedAsync = this.onFileSelectedAsync.bind(this);
	}

	public render() {
		return (
			<div
				className="add-room"
				onClick={this.addRoom}>
				<label htmlFor='add-room-input' className="add-room__rect"></label>
				<div className="add-room__plus">
					<span className="add-room__barh"></span>
					<span className="add-room__barv"></span>
				</div>
				<input
					id="add-room-input"
					type="file"
					className="add-room-input-element"
					onChange={this.onFileSelectedAsync}
					onClick={this.onInputClick}
				/>
			</div>
		);
	}

	private async onFileSelectedAsync(event: React.ChangeEvent<HTMLInputElement>) {
		const file = event.target.files && event.target.files[0];

		// Verify if input file is of valid type and format
		await FileLoader.validateFileLoadEvent(file, 'image');

		const fileData = await FileLoader.getBinaryFileData(file) as string;
		const resizedImage = await resizeImageAsync(fileData, 'backgroundImage');

		const roomId: string = sceneInteractor.addRoom();
		const room: Room = sceneInteractor.getRoomById(roomId);

		room.setBackgroundImageBinaryData(resizedImage.backgroundImage);
		room.setThumbnail(resizedImage.thumbnail);

		this.props.onRoomAdded();
	}

	private onInputClick(event) {
		event.target.value = '';
	}

	private addRoom() {
		if (!userInteractor.isLoggedIn()) {
			openModalEvent.emit({
				bodyText: 'You must be logged in to create more rooms',
				headerText: 'Error',
				isMessage: false,
				modalType: 'message',
			});
			return;
		}
	}
}
