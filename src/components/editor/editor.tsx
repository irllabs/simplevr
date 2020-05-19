import React from 'react';

import EditStory2d from './edit-story-2d/edit-story-2d';
import RoomHotspots from './room-hotspots/room-hotspots';
import Checkbox from '../checkbox/checkbox';

import Fab, {FabActionItem} from 'irl-ui/fab/fab';

import sceneInteractor from 'core/scene/sceneInteractor';
import hotspotAddedEvent from 'root/events/hotspot-added-event';
import responsiveUtil from 'ui/editor/util/responsiveUtil';

import colors from 'styles/colors';
import './editor.scss';
import EditStory3d from './edit-story-3d/edit-story-3d';
import PreviewSpace from './preview-space/preview-space';
import openModalEvent from 'root/events/open-modal-event';
import eventBus from 'ui/common/event-bus';
import uuid from 'uuid/v1';
import { roomsUpdatedEvent } from 'root/events/event-manager';

interface EditorProps {
	preview: boolean;
	onPreviewToggle: (enabled: boolean) => void;
}

interface EditorState {
	currentRoomId: string;
	isInFlatMode: boolean;
	isPreview: boolean;
	isReadOnly: boolean;
	isSphereMode: boolean;
}

export default class Editor extends React.Component<EditorProps, EditorState> {
	private roomsUpdatedEventId = uuid();

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

	constructor(props: EditorProps) {
		super(props);

		this.state = {
			currentRoomId: sceneInteractor.getActiveRoomId(),
			isInFlatMode: !this.props.preview,
			isPreview: this.props.preview,
			isReadOnly: false,
			isSphereMode: false,
		};

		this.onAddActionClick = this.onAddActionClick.bind(this);
		this.on2d3dViewClick = this.on2d3dViewClick.bind(this);
		this.onEditPlayChange = this.onEditPlayChange.bind(this);
		this.onTest = this.onTest.bind(this);
		this.update = this.update.bind(this);
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
			<div className="editor-container">
				{this.state.isInFlatMode && <EditStory2d />}
				{!this.state.isInFlatMode && !this.state.isPreview && <EditStory3d />}
				{this.state.isPreview && <PreviewSpace />}
				{!this.state.isPreview &&
				<div className='editor-add-container'>
					<Fab onClick={this.onAddActionClick} color={colors.primary} actionItems={this._addMenuItems} />
				</div>}
				{this.state.isInFlatMode && <RoomHotspots roomId={this.state.currentRoomId} />}

				<div className={`editor_center ${!this.hasBackgroundImage() ? 'editor_center1' : ''}`}>
					{this.roomEditorIsVisible() &&
					<div className="editor__edit2D3DToggle">
						<p className='center-panel'>
							Edit 3D
						</p>
						<Checkbox
							initialValue={!this.state.isInFlatMode}
							disabled={!this.isLoadedAssets()}
							onChange={this.on2d3dViewClick}
							name='edit-3d'
							className='editor__edit2d3dToggleButton'>
						</Checkbox>
					</div>}

					{this.showPreviewCheckbox() &&
					<div className="editor__editPlayToggle">
						<p className='center-panel'>
							Preview
						</p>
						<Checkbox
							initialValue={this.state.isPreview}
							disabled={!this.isLoadedAssets()}
							onChange={this.onEditPlayChange}
							name='preview'
							className="editor__editPlayToggleButton">
						</Checkbox>
					</div>}
				</div>
			</div>
		);
	}

	private update() {
		this.setState({
			currentRoomId: sceneInteractor.getActiveRoomId(),
		});
		this.forceUpdate();
	}

	private onAddActionClick(actionName: string): void {
		if (actionName === 'new-hotspot') {
			this.addUniversal();
		}
		if (actionName === 'new-door') {
			this.addDoor();
		}
		this.update();
	}

	private addDoor() {
		const numberOfRooms = sceneInteractor.getRoomIds().length;
	
		if (numberOfRooms < 2) {
			openModalEvent.emit({
				isMessage: false,
				bodyText: 'There must be at least two rooms to add a door.',
				headerText: '',
				modalType: 'message',
			});
			return;
		}
	
		const activeRoomId: string = sceneInteractor.getActiveRoomId();
		const door = sceneInteractor.addDoor(activeRoomId);
	
		eventBus.onSelectProperty(door.getId(), true);
	
		// auto open door editor if there are multiple outgoing choices
		if (numberOfRooms > 2) {
			setTimeout(() => {
				eventBus.onSelectProperty(door.getId(), false, true);
			});
		}

		hotspotAddedEvent.emit({
			id: door.getId(),
		});
	}

	private addUniversal(): void {
		const activeRoomId: string = sceneInteractor.getActiveRoomId();
		const universal = sceneInteractor.addUniversal(activeRoomId);

		hotspotAddedEvent.emit({
			id: universal.getId(),
		});
	}

	private hasBackgroundImage(): boolean {
		const activeRoomId: string = sceneInteractor.getActiveRoomId();
		return sceneInteractor.roomHasBackgroundImage(activeRoomId);
	}

	private roomEditorIsVisible(): boolean {
		if (responsiveUtil.isMobile()) {
			/*return this.hasBackgroundImage()
				&& !this.isPreview()
				&& !this.hotspotMenuIsOpen
				&& !this.hotspotEditorIsOpen;*/
		}
		return this.hasBackgroundImage() && !this.state.isPreview;
	}

	private showPreviewCheckbox(): boolean {
		return ((this.roomEditorIsVisible() || this.state.isPreview) && !this.state.isReadOnly);
	}

	public isLoadedAssets() {
		const isLoaded = sceneInteractor.isLoadedAssets();

		return isLoaded;
	}

	private on2d3dViewClick($event) {
		if ($event) {
			this.on3dViewClick();
		} else {
			this.on2dViewClick();
		}
	}

	private on2dViewClick() {
		// this.router.navigate(['/editor', { outlets: { 'view': 'flat' } }]);
		this.setState({
			isInFlatMode: true,
			isSphereMode: false,
		});
	}

	private on3dViewClick() {
		// this.router.navigate(['editor', { outlets: { 'view': 'sphere' } }]);
		this.setState({
			isInFlatMode: false,
			isSphereMode: true,
		});
	}

	private onEditPlayChange(checked) {
		this.props.onPreviewToggle(checked);

		//this.eventBus.onStartLoading();
		if (checked) {
		//console.log('switch to preview');
			this.setState({
				isPreview: true,
				isInFlatMode: false,
				isSphereMode: false,
			});
		} else {
			if (this.state.isInFlatMode) {
				this.setState({
					isPreview: false,
					isInFlatMode: true,
					isSphereMode: false,
				});
			} else {
				this.setState({
					isPreview: false,
					isInFlatMode: false,
					isSphereMode: true,
				});
			}
		}
	}

	private onTest() {
		console.log('test');
	}
}
