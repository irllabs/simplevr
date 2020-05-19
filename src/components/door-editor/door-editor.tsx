import React from 'react';

import './door-editor.scss';
import { Door } from 'data/scene/entities/door';
import sceneInteractor from 'core/scene/sceneInteractor';
import { DEFAULT_DOOR_NAME } from 'ui/common/constants';
import eventBus from 'ui/common/event-bus';
import Checkbox from '../checkbox/checkbox';
import TextInputMaterial from '../text-input-material/text-input-material';
import { roomsUpdatedEvent } from 'root/events/event-manager';

interface DoorEditorProps {
	doorProperty: Door;
}

interface DoorEditorState {
	roomList: any[];
}

export default class DoorEditor extends React.Component<DoorEditorProps, DoorEditorState> {
	private selectedRoom: any;
	private lastAutogoValue: number;

	// TODO: remove this value when slider is implemented
	private autoTimeViewModel: number = 0;

	constructor(props: DoorEditorProps) {
		super(props);

		this.state = {
			roomList: [],
		};

		this.onRoomChange = this.onRoomChange.bind(this);
		this.onTransportClick = this.onTransportClick.bind(this);
		this.onCheckboxChange = this.onCheckboxChange.bind(this);
		this.onSecondsChange = this.onSecondsChange.bind(this);
		this.onSecondsBlur = this.onSecondsBlur.bind(this);
	}

	public componentDidMount() {
		this.lastAutogoValue = this.props.doorProperty.getAutoTime() || 20;
		this.autoTimeViewModel = this.lastAutogoValue;

		this.setState({
			roomList: this.createRoomList(),
		}, () => {
			if (!this.state.roomList.length) {
				return;
			}
			this.selectedRoom = this.state.roomList
			.find(room => room.id === this.props.doorProperty.getRoomId()) || this.state.roomList[0];
			this.onRoomChange(null);
		})
	}

	public componentDidUpdate(prevProps: DoorEditorProps) {
		if (prevProps.doorProperty.getId() === this.props.doorProperty.getId()) {
			return;
		}

		this.setState({
			roomList: this.createRoomList(),
		}, () => {
			if (!this.state.roomList.length) {
				return;
			}
			this.selectedRoom = this.state.roomList
			.find(room => room.id === this.props.doorProperty.getRoomId()) || this.state.roomList[0];
			this.onRoomChange(null);
		})
	}

	public render() {
		return (
			<div>
				<div>
					<p className="hotspot-inspector__label">
						Door to:
					</p>
					<select
						value={this.selectedRoom}
						onChange={this.onRoomChange}
						className="hotspot-inspector__select door-editor__select">
						
						{this.state.roomList.map((room) => {
							return (
								<option
									key={room.id}
									selected={room.id === this.selectedRoom}
									disabled={room.disabled}
									value={room}>
										{room.name}
								</option>
							);
						})}
						
					</select>
				</div>

				{this.showTransportButton() &&
				<div className="button door-editor__go-button">
					<p onClick={this.onTransportClick}>
						Go!
					</p>
				</div>}

				<div className="auto-go">

					<span className="hotspot-inspector__label width-auto">
						Auto
					</span>

					<Checkbox
						initialValue={this.sliderIsVisible()}
						onChange={this.onCheckboxChange}
						disabled={false}>
					</Checkbox>

					<TextInputMaterial
						inputType='number'
						inputLabel='Seconds (between 1 and 60)'
						onTextChange={this.onSecondsChange}
						onBlurEvent={this.onSecondsBlur}
						className={`auto-go__input-box ${this.sliderIsVisible() ? 'auto-go__input-box--visible' : ''}`}>
					</TextInputMaterial>
				</div>
			</div>
		);
	}

	private createRoomList(): any[] {
		const roomList = sceneInteractor.getRoomIds()
		  .filter(roomId => roomId !== sceneInteractor.getActiveRoomId())
		  .map(roomId => {
			const room = sceneInteractor.getRoomById(roomId);
			return { id: room.getId(), name: room.getName(), disabled: false };
		  });
		roomList.unshift({ id: '', name: DEFAULT_DOOR_NAME, disabled: true });
		return roomList;
	  }

	  private onRoomChange(event) {
		if (!this.selectedRoom) return;
	
		this.props.doorProperty.setRoomId(this.selectedRoom.id);
		if (event) {
		  this.setDefaultRoomName();
		}
	  }

	  private setDefaultRoomName() {
		const defaultRoomName: string = sceneInteractor
		  .getRoomById(this.selectedRoom.id)
		  .getName();
	
		setTimeout(() => {
		  this.props.doorProperty.setName(defaultRoomName);
		  this.props.doorProperty.setNameIsCustom(false);
		});
	  }

	  private showTransportButton(): boolean {
		return !!this.props.doorProperty.getRoomId();
	  }

	  private onTransportClick() {
		const outgoingRoomId = this.props.doorProperty.getRoomId();
		sceneInteractor.setActiveRoomId(outgoingRoomId);
		// eventBus.onSelectRoom(outgoingRoomId, false);

		roomsUpdatedEvent.emit({});
	  }

	  private getDoorAutotime(): number {
		return this.props.doorProperty.getAutoTime();
	  }

	  private setDoorAutotime($event) {
		this.props.doorProperty.setAutoTime(parseInt($event.target.value));
	  }

	  private onCheckboxChange($event) {
		const autoTime = $event ? this.lastAutogoValue : 0;
		if (!$event) {
		  this.lastAutogoValue = this.props.doorProperty.getAutoTime();
		}
		this.props.doorProperty.setAutoTime(autoTime);

		this.forceUpdate();
	  }

	  private sliderIsVisible(): boolean {
		return this.props.doorProperty.getAutoTime() > 0;
	  }

	  private getAutoTimeViewModel() {
		return this.autoTimeViewModel;
	  }

	  private onSecondsChange($event) {
		this.autoTimeViewModel = parseFloat($event.text);
	  }

	  private onSecondsBlur($event) {
		if (Number.isNaN(this.autoTimeViewModel)) {
		  this.autoTimeViewModel = 0;
		}
		const value = Math.floor(this.autoTimeViewModel);
		const clampedValue = Math.max(1, Math.min(60, value));
		this.lastAutogoValue = this.props.doorProperty.getAutoTime();
		this.props.doorProperty.setAutoTime(clampedValue);
		this.autoTimeViewModel = clampedValue;
	  }
}
