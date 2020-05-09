import { Door } from 'data/scene/entities/door';
import { Room } from 'data/scene/entities/room';
import { Universal } from 'data/scene/entities/universal';
import { RoomProperty } from 'data/scene/interfaces/roomProperty';

import roomManager from './../../data/scene/roomManager';
import settingsInteractor from './../../core/settings/settingsInteractor';
import propertyBuilder from './../../data/scene/roomPropertyBuilder';
import metaDataInteractor from './projectMetaDataInteractor';
import eventBus from '../../ui/common/event-bus';
import assetManager from './../../data/asset/assetManager';

class SceneInteractor {
	private _activeRoomId: string;

	constructor() {
		if (!this.getRoomIds().length) {
			this.addRoom(true);
		}
	}

	public isLoadedAssets() {
		const rooms = Array.from(roomManager.getRooms());
		const hasRoomWithoutAssets = rooms.find(room => !room.isLoadedAssets);

		return !hasRoomWithoutAssets;
	}

	changeRoomPosition(room, position) {
		const rooms = roomManager.getRooms();

		roomManager.clearRooms();
		rooms.delete(room);

		const roomsArray = Array.from(rooms);

		rooms.clear();

		roomsArray.splice(position, 0, room);

		roomsArray.forEach(room => roomManager.addRoom(room));
	}

	getRoomIds(): string[] {
		return Array.from(roomManager.getRooms())
			.map(room => room.getId());
	}

	getRoomById(roomId: string): Room {
		return roomManager.getRoomById(roomId);
	}

	addRoom(silent = false): string {
		const numberOfRooms: number = roomManager.getRooms().size;

		if(!silent){
			const { maxRooms } = settingsInteractor.settings;
			if(numberOfRooms >= maxRooms){
				throw new Error('You have reached maximum amount of rooms');
			}
		}

		const roomName: string = `Room ${numberOfRooms+1}`;
		const room: Room = propertyBuilder.room(roomName);

		roomManager.addRoom(room);
		this._activeRoomId = room.getId();

		if (!silent) {
			metaDataInteractor.onProjectChanged();
		}

		return this._activeRoomId;
	}

	removeRoom(roomId: string) {
		if (this.getRoomIds().length < 2) {
			console.warn('user should not be allowed to remove last room');
			return;
		}
		eventBus.onModalMessage(
			'',
			'Do you want to delete the room?',
			true,
			// modal dismissed callback
			() => {
			},
			// modal accepted callback
			() => {
				this._activeRoomId = null;
				roomManager.removeRoomById(roomId);

				//remove door references to deleted room
				Array.from(roomManager.getRooms())
					.map(room => room.getDoors())
					.reduce((aggregateList, doorSet) => {
						return aggregateList.concat(
							Array.from(doorSet).filter(door => door.getRoomId() === roomId),
						);
					}, [])
					.forEach(door => door.reset());

					metaDataInteractor.onProjectChanged();
			},
		);
	}

	getActiveRoomId(): string {
		if (!this._activeRoomId) {
			return this.getRoomIds()[0];
		}
		return this._activeRoomId;
	}

	getActiveRoom(): Room {
		return this.getRoomById(this.getActiveRoomId())
	}

	setActiveRoomId(roomId: string) {
		this._activeRoomId = roomId;
		metaDataInteractor.onProjectChanged();
	}

	getRoomProperties(roomId: string): RoomProperty[] {
		const room: Room = this.getRoomById(roomId);

		if (!room) {
			return null;
		}

		return [
			...Array.from(room.getUniversal()),
			...Array.from(room.getDoors()),
		]
			.sort((a, b) => a.getTimestamp() - b.getTimestamp());
	}

	getPropertyById(roomId: string, propertyId: string): RoomProperty {
		return this.getRoomProperties(roomId)
			.find(roomProperty => roomProperty.getId() === propertyId);
	}

	addUniversal(roomId: string): Universal {
		const { maxHotspots } = settingsInteractor.settings;
		const numberOfUniversals: number = this.getRoomById(roomId).getUniversal().size;

		if(numberOfUniversals >= maxHotspots) {
			throw new Error('You have reached maximum amount of hotspots per room')
		}

		const hotSpotName: string = `Hotspot ${numberOfUniversals+1}`;

		const universal: Universal = propertyBuilder.universal(hotSpotName, '');
		console.log(universal);

		this.getRoomById(roomId).addUniversal(universal, false);

		metaDataInteractor.onProjectChanged();

		return universal;
	}

	removeUniversal(roomId: string, universal: Universal) {
		if (universal.hasData) {
			eventBus.onModalMessage(
				'',
				'Do you want to delete the hotspot?',
				true,
				// modal dismissed callback
				() => {
				},
				// modal accepted callback
				() => {
					this._removeUniversal(roomId, universal);
				},
			);
		} else {
			this._removeUniversal(roomId, universal);
		}
	}

	_removeUniversal(roomId: string, universal: Universal) {
		this.getRoomById(roomId).removeUniversal(universal);
		metaDataInteractor.onProjectChanged();
	}

	addDoor(roomId: string): Door {
		const outgoingRoomId = this.getRoomIds().filter(rId => rId !== roomId)[0];
		const outgoingRoomName = this.getRoomById(outgoingRoomId).getName();
		const door: Door = propertyBuilder.door(outgoingRoomId, outgoingRoomName);

		// if there are multiple options, let the user decide
		if (this.getRoomIds().length > 2) {
			door.reset();
		}

		this.getRoomById(roomId).addDoor(door);

		metaDataInteractor.onProjectChanged();

		return door;
	}

	removeDoor(roomId: string, door: Door) {
		this.getRoomById(roomId).removeDoor(door);
		metaDataInteractor.onProjectChanged();
	}

	roomHasBackgroundImage(roomId: string): boolean {
		return this.getRoomById(roomId).hasBackgroundImage();
	}

	getHomeRoomId(): string {
		return roomManager.getHomeRoomId();
	}

	isHomeRoom(roomId: string): boolean {
		return roomId === roomManager.getHomeRoomId();
	}

	setHomeRoomId(roomId: string) {
		roomManager.setHomeRoomId(roomId);
		metaDataInteractor.onProjectChanged();
	}

	resetRoomManager() {
		roomManager.initValues();
		assetManager.clearAssets();
		this.addRoom();
	}

	setRoomName(roomId: string, name: string) {
		this.getRoomById(roomId).setName(name);

		// Rename all doors going to the renamed room
		this.getRoomIds()
			.map(roomId => this.getRoomById(roomId).getDoors())
			.reduce((aggregateList, doorSet) => {
				const doorsToRenamedRoom: Door[] = Array.from(doorSet)
					.filter(door => door.getRoomId() === roomId && !door.hasCustomName());
				return aggregateList.concat(doorsToRenamedRoom);
			}, [])
			.forEach(door => door.setName(name));

		metaDataInteractor.onProjectChanged();
	}
}
export default new SceneInteractor();
