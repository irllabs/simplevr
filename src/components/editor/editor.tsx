import React from 'react';

import EditStory2d from './edit-story-2d/edit-story-2d';
import RoomHotspots from './room-hotspots/room-hotspots';

import Fab, {FabActionItem} from 'irl-ui/fab/fab';

import sceneInteractor from 'core/scene/sceneInteractor';
import hotspotAddedEvent from 'root/events/hotspot-added-event';

import colors from 'styles/colors';
import './editor.scss';

interface EditorState {
	currentRoomId: string;
}

export default class Editor extends React.Component<{}, EditorState> {
	private _addMenuItems: FabActionItem[] = [
		{
			name: 'New hotspot',
			action: 'new-hotspot',
			icon: 'icons/new-hotspot.svg',
		},
		{
			name: 'New door',
			action: 'new-door',
			icon: 'icons/new-door.svg'
		}
	];

	constructor(props: {}) {
		super(props);

		this.state = {
			currentRoomId: sceneInteractor.getActiveRoomId(),
		};

		this.onAddActionClick = this.onAddActionClick.bind(this);
	}

	public render() {
		return (
			<div className="editor-container">
				<EditStory2d />
				<div className='editor-add-container'>
					<Fab onClick={this.onAddActionClick} color={colors.primary} actionItems={this._addMenuItems} />
				</div>
				<RoomHotspots roomId={this.state.currentRoomId} />
			</div>
		);
	}

	private onAddActionClick(actionName: string): void {
		if (actionName === 'new-hotspot') {
			this.addUniversal();
		}
	}

	private addUniversal(): void {
		const activeRoomId: string = sceneInteractor.getActiveRoomId();
		const universal = sceneInteractor.addUniversal(activeRoomId);

		hotspotAddedEvent.emit({
			id: universal.getId(),
		});
	}
}
