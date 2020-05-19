import React from 'react';

import TextInput from 'components/text-input/text-input';

import { RoomPropertyTypeService } from 'ui/editor/util/roomPropertyTypeService';
import sceneInteractor from 'core/scene/sceneInteractor';
import propertyRemovalService from 'ui/editor/util/propertyRemovalService';

import './storymap-item.scss';

interface StorymapItemProps {
	roomProperty: any;
	isActive: boolean;
	roomId: string;
	hasPrevRoom: boolean;
	hasNextRoom: boolean;
	onInfoClick: () => void;
	onMoveRoom: (data: any) => void;
	onClick: () => void;
	onDeleteRoom: () => void;
}

export default class StorymapItem extends React.Component<StorymapItemProps, {}> {
	private propertyIsRoom: any;

	constructor(props: StorymapItemProps) {
		super(props);

		this.onNameChange = this.onNameChange.bind(this);
		this.onInfoClick = this.onInfoClick.bind(this);
		this.onDeleteClick = this.onDeleteClick.bind(this);
		this.setAsHomeRoom = this.setAsHomeRoom.bind(this);
	}

	public componentDidMount() {
		this.propertyIsRoom = RoomPropertyTypeService.getTypeString(this.props.roomProperty) === 'room';
	}

	public render() {
		return (
			<div onClick={this.props.onClick} className={`story-scroll__storymap-item storymap-item ${!this.props.roomProperty.isLoadedAssets ? 'loading' : ''}`}>
				<div className="storymap-item__roomname">
					<TextInput
						label={this.getName()}
						isRoomName={true}
						onModelChange={this.onNameChange}>
					</TextInput>
				</div>

				<div className="story-map-item__buttons">
					<img
						className={`storymap-item__button storymap-item__move-left ${!this.props.hasPrevRoom ? 'disabled' : ''}`}
						onClick={() => {
							this.onMoveRoom(this.props.roomId, -1, this.props.hasPrevRoom);
						}}
						src='assets/icons/arrow_left_filled.png'>
					</img>

					<img
						className="storymap-item__button storymap-item__delete"
						onClick={this.onDeleteClick}
						src='assets/icons/delete_filled.png'>
					</img>

					<img
						className="storymap-item__button storymap-item__info"
						onClick={this.onInfoClick}
						src='assets/icons/info_filled.png'>
					</img>
					
					{this.isHomeRoom() &&
					<img
						onClick={this.setAsHomeRoom}
						className={`storymap-item__button storymap-item__home-icon`}
						src='assets/icons/home.png'>
					</img>}
					
					{!this.isHomeRoom() &&
					<img
						onClick={this.setAsHomeRoom}
						className={`storymap-item__button storymap-item__home-icon`}
						src='assets/icons/home_filled.png'>
					</img>}

					<img
						className={`storymap-item__button storymap-item__move-right ${!this.props.hasNextRoom ? 'disabled' : ''}`}
						onClick={() => {
							this.onMoveRoom(this.props.roomId, 1, this.props.hasNextRoom);
						}}
						src='assets/icons/arrow_right_filled.png'>
					</img>

				</div>

				<div className='storymap-item__thumbnailbox'>
					{!this.props.roomProperty.isLoadedAssets &&
					<div className="loading-progress">
						<span>
							{this.props.roomProperty.loadingPercents}%
						</span>
					</div>}
					{this.props.roomProperty.isLoadedAssets &&
					<img
						src={this.getBackgroundThumbnail()}
						className={`storymap-item__thumbnail ${this.props.isActive ? 'storymap-item__thumbnail--active' : ''}`}
					/>}
				</div>
			</div>
		);
	}

	onDeleteClick() {
		if (this.isHomeRoom()) {
			sceneInteractor.setHomeRoomId(null);
		}
		propertyRemovalService.removeProperty(this.props.roomProperty);

		this.props.onDeleteRoom();
	}
	
	onInfoClick() {
		this.props.onInfoClick();
	}
	
	onMoveRoom(roomId, direction, enabled) {
		if (enabled) {
			this.props.onMoveRoom({roomId, direction});
		}
	}
	
	getLabelText() {
		return this.props.roomProperty.getName();
	}
	
	onLabelChange($event) {
		if (this.propertyIsRoom) {
			sceneInteractor.setRoomName(this.props.roomProperty.getId(), $event.text);
		}
		else {
			this.props.roomProperty.setName($event.text);
		}
	}
	
	isHomeRoom(): boolean {
		const roomId: string = this.props.roomProperty.getId();
		return sceneInteractor.isHomeRoom(roomId);
	}
	
	setAsHomeRoom() {
		const roomId: string = this.props.roomProperty.getId();
		sceneInteractor.setHomeRoomId(roomId);
	}
	
	getBackgroundThumbnail(): string {
		const roomId: string = this.props.roomProperty.getId();
		const room = sceneInteractor.getRoomById(roomId);
		return room.getThumbnailImage();
	}
	
	private getRoomName(): string {
		const roomId = sceneInteractor.getActiveRoomId();
		const room = sceneInteractor.getRoomById(roomId);
		return room.getName();
	}
	
	private setRoomName($event) {
		const roomId = sceneInteractor.getActiveRoomId();
		const room = sceneInteractor.getRoomById(roomId);
		room.setName($event.text);
	}
	
	getName(): string {
		return this.props.roomProperty.getName();
	}
	
	onNameChange($event) {
		this.props.roomProperty.setName($event.text);
	}
}
