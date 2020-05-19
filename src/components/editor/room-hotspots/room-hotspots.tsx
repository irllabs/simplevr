import React from 'react';
import uuid from 'uuid/v1';

import sceneInteractor from 'core/scene/sceneInteractor';
import hotspotAddedEvent from 'root/events/hotspot-added-event';
import { RoomProperty } from 'data/scene/interfaces/roomProperty';

import Hotspot from './hotspot/hotspot';
import RoomIcon from 'root/components/room-icon/room-icon';
import { hotspotRemovedEvent } from 'root/events/event-manager';

interface RoomHotspotsState {
	roomHotspots: RoomProperty[];
}

interface RoomHotspotsProps {
	roomId: string;
}

export default class RoomHotspots extends React.Component<RoomHotspotsProps, RoomHotspotsState> {
	private _hotspotAddedEventId = uuid();
	private _hotspotRemovedEventId = uuid();

	constructor(props: RoomHotspotsProps) {
		super(props);

		this.state = {
			roomHotspots: sceneInteractor.getRoomProperties(this.props.roomId),
		};

		this.onHotspotAdded = this.onHotspotAdded.bind(this);
		this.onHotspotDeleted = this.onHotspotDeleted.bind(this);
	}

	public componentDidMount() {
		hotspotRemovedEvent.subscribe({
			id: this._hotspotRemovedEventId,
			callback: this.onHotspotDeleted,
		});

		hotspotAddedEvent.subscribe({
			callback: this.onHotspotAdded,
			id: this._hotspotAddedEventId,
		});
	}

	public componentWillUnmount() {
		hotspotAddedEvent.unsubscribe(this._hotspotAddedEventId);
		hotspotRemovedEvent.unsubscribe(this._hotspotRemovedEventId);
	}

	public componentDidUpdate(prevProps: RoomHotspotsProps) {
		if (prevProps.roomId !== this.props.roomId) {
			this.setState({
				roomHotspots: sceneInteractor.getRoomProperties(this.props.roomId),
			});
		}
	}

	public render() {
		return (
			<div>
				{this.state.roomHotspots.map((roomHotspot) => {
					return (
						<RoomIcon
							key={roomHotspot.getId()}
							roomProperty={roomHotspot}
						/>
					);
				})}
			</div>
		);
	}

	private onHotspotAdded() {
		this.setState({
			roomHotspots: sceneInteractor.getRoomProperties(this.props.roomId),
		});
	}

	private onHotspotDeleted() {
		this.setState({
			roomHotspots: sceneInteractor.getRoomProperties(this.props.roomId),
		});
	}
}
