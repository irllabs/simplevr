import React from 'react';
import uuid from 'uuid/v1';

import sceneInteractor from 'core/scene/sceneInteractor';
import hotspotAddedEvent from 'root/events/hotspot-added-event';
import { RoomProperty } from 'data/scene/interfaces/roomProperty';

import Hotspot from './hotspot/hotspot';

interface RoomHotspotsState {
	roomHotspots: RoomProperty[];
}

interface RoomHotspotsProps {
	roomId: string;
}

export default class RoomHotspots extends React.Component<RoomHotspotsProps, RoomHotspotsState> {
	private _hotspotAddedEventId = uuid();

	constructor(props: RoomHotspotsProps) {
		super(props);

		this.state = {
			roomHotspots: sceneInteractor.getRoomProperties(this.props.roomId),
		};

		this.onHotspotAdded = this.onHotspotAdded.bind(this);
	}

	public componentDidMount() {
		hotspotAddedEvent.subscribe({
			callback: this.onHotspotAdded,
			id: this._hotspotAddedEventId,
		});
	}

	public componentWillUnmount() {
		hotspotAddedEvent.unsubscribe(this._hotspotAddedEventId);
	}

	public render() {
		return (
			<div>
				{this.state.roomHotspots.map((roomHotspot) => {
					return (
						<Hotspot key={roomHotspot.getId()} roomProperty={roomHotspot} />
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
}
