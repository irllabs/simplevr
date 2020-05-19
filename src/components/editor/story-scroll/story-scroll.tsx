import React from 'react';

import './story-scroll.scss';

import RoomEditor from './../room-editor/room-editor';
import StorymapItem from './storymap-item/storymap-item';
import AddRoom from './add-room/add-room';

import sceneInteractor from 'core/scene/sceneInteractor';
import settingsInteractor from 'core/settings/settingsInteractor';
import { roomsUpdatedEvent } from 'root/events/event-manager';
import uuid from 'uuid/v1';

interface StoryScrollState {
	isOpen: boolean;
	inspectorIsVisible: boolean;
}

export default class StoryScroll extends React.Component<{}, StoryScrollState> {
	private activeRoomIsExpanded;
	private roomsUpdatedEventId = uuid();

	constructor(props: {}) {
		super(props);

		this.state = {
			isOpen: false,
			inspectorIsVisible: false,
		};

		this.toggleOpen = this.toggleOpen.bind(this);
		this.update = this.update.bind(this);
		this.onOffClick = this.onOffClick.bind(this);
		this.onSwapRoom = this.onSwapRoom.bind(this);
		this.onInfoClick = this.onInfoClick.bind(this);
	}

	public get canAddMoreRooms() {
		return this.roomIds.length < settingsInteractor.settings.maxRooms
	}

	public get roomIds(): string[] {
		return sceneInteractor.getRoomIds();
	}

	public componentDidMount() {
		roomsUpdatedEvent.subscribe({
			id: this.roomsUpdatedEventId,
			callback: this.update,
		});
	}

	public componentWillUnmount() {
		roomsUpdatedEvent.unsubscribe(this.roomsUpdatedEventId);
	}

	public render() {
		return (
			<div className={`story-scroll ${this.state.isOpen ? 'stroy-scroll--open' : ''}`}>
				{this.state.inspectorIsVisible &&
				<div className="story-scroll__room-editor">
					<RoomEditor
						onOffClick={this.onOffClick}
					/>
				</div>}

				{!this.state.inspectorIsVisible &&
				<div>
					<div onClick={this.toggleOpen} className="story-scroll__toggle-button">
						<span className={`story-scroll__toggle-arrow story-scroll__toggle-arrow-left ${this.state.isOpen ? 'story-scroll__toggle-arrow-left--open' : ''}`}>
						</span>
						<span className={`story-scroll__toggle-arrow story-scroll__toggle-arrow-right ${this.state.isOpen ? 'story-scroll__toggle-arrow-right--open' : ''}`}>
						</span>
					</div>
				</div>}

				<div className="story-scroll__scroll">
					<div className="story-scroll__room-group">
						{this.roomIds.map((roomId) => {
							return (
								<div
									key={roomId}
									className="story-scroll__room">
									<StorymapItem
										roomProperty={this.getRoomById(roomId)}
										isActive={this.roomIsSelected(roomId)}
										hasPrevRoom={this.hasPrevRoomFor(roomId)}
										hasNextRoom={this.hasNextRoomFor(roomId)}
										roomId={roomId}
										onClick={() => {
											this.roomIsLoaded(roomId) && this.onRoomSelect(roomId)
										}}
										onInfoClick={this.onInfoClick}
										onMoveRoom={this.onSwapRoom}
										onDeleteRoom={this.update}
									>
									</StorymapItem>
								</div>
							);
						})}
					</div>
					{this.canAddMoreRooms && <AddRoom onRoomAdded={this.update}/>}
				</div>
			</div>
		);
	}

	private update() {
		this.forceUpdate();
	}

	private onOffClick() {
		if (this.state.inspectorIsVisible) {
			this.setState({
				inspectorIsVisible: false,
			});
		}
	}

	private toggleOpen() {
		this.setState({
			isOpen: !this.state.isOpen
		});
	}

	public getRoomById(roomId: string) {
		return sceneInteractor.getRoomById(roomId);
	}

	public roomIsSelected(roomId: string): boolean {
		const numberOfRooms: number = this.roomIds.length;
	
		if (numberOfRooms === 0) {
			return false;
		}
		return roomId === sceneInteractor.getActiveRoomId();
	}

	public hasPrevRoomFor(roomId) {
		return this.roomIds.indexOf(roomId) > 0;
	}
	
	public hasNextRoomFor(roomId) {
		return this.roomIds.indexOf(roomId) < this.roomIds.length - 1;
	}

	public roomIsLoaded(roomId: string): boolean {
		const room = sceneInteractor.getRoomById(roomId);
	
		return room.isLoadedAssets;
	}

	public onRoomSelect(roomId: string) {
		const activeRoomId: string = sceneInteractor.getActiveRoomId();
	
		if (roomId === activeRoomId) {
			this.activeRoomIsExpanded = !this.activeRoomIsExpanded;
		} else {
			this.activeRoomIsExpanded = true;
		}
	
		sceneInteractor.setActiveRoomId(roomId);
		
		roomsUpdatedEvent.emit({});
	}

	public onInfoClick() {
		this.setState({
			inspectorIsVisible: true
		});
	}

	public onSwapRoom({ roomId, direction }) {
		const room = sceneInteractor.getRoomById(roomId);
		const currentIndex = this.roomIds.indexOf(roomId);
	
		sceneInteractor.changeRoomPosition(room, currentIndex + direction);
	}
}
