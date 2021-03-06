import { Injectable } from '@angular/core';
import { AssetManager } from 'data/asset/assetManager';

import { Door } from 'data/scene/entities/door';
import { Room } from 'data/scene/entities/room';
import { Universal } from 'data/scene/entities/universal';
import { RoomProperty } from 'data/scene/interfaces/roomProperty';

import { RoomManager } from 'data/scene/roomManager';
import { PropertyBuilder } from 'data/scene/roomPropertyBuilder';
import { MetaDataInteractor } from './projectMetaDataInteractor';

@Injectable()
export class SceneInteractor {
  private _activeRoomId: string;

  constructor(
    private roomManager: RoomManager,
    private propertyBuilder: PropertyBuilder,
    private assetManager: AssetManager,
    private projectMetaDataInteractor: MetaDataInteractor,
  ) {
    if (!this.getRoomIds().length) {
      this.addRoom(true);
    }
  }

  public isLoadedAssets() {
    const rooms = Array.from(this.roomManager.getRooms());
    const hasRoomWithoutAssets = rooms.find(room => !room.isLoadedAssets);

    return !hasRoomWithoutAssets;
  }

  getRoomIds(): string[] {
    return Array.from(this.roomManager.getRooms())
      .map(room => room.getId());
  }

  getRoomById(roomId: string): Room {
    return this.roomManager.getRoomById(roomId);
  }

  addRoom(silent = false): string {
    const numberOfRooms: number = this.roomManager.getRooms().size + 1;
    const roomName: string = `Room ${numberOfRooms}`;
    const room: Room = this.propertyBuilder.room(roomName);

    this.roomManager.addRoom(room);
    this._activeRoomId = room.getId();

    if (!silent) {
      this.projectMetaDataInteractor.onProjectChanged();
    }

    return this._activeRoomId;
  }

  removeRoom(roomId: string) {
    if (this.getRoomIds().length < 2) {
      console.warn('user should not be allowed to remove last room');
      return;
    }
    this._activeRoomId = null;
    this.roomManager.removeRoomById(roomId);

    //remove door references to deleted room
    Array.from(this.roomManager.getRooms())
      .map(room => room.getDoors())
      .reduce((aggregateList, doorSet) => {
        return aggregateList.concat(
          Array.from(doorSet).filter(door => door.getRoomId() === roomId),
        );
      }, [])
      .forEach(door => door.reset());

    this.projectMetaDataInteractor.onProjectChanged();
  }

  getActiveRoomId(): string {
    if (!this._activeRoomId) {
      return this.getRoomIds()[0];
    }
    return this._activeRoomId;
  }

  setActiveRoomId(roomId: string) {
    this._activeRoomId = roomId;
    this.projectMetaDataInteractor.onProjectChanged();
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
    const numberOfUniversals: number = this.getRoomById(roomId).getUniversal().size + 1;
    const hotSpotName: string = `Hotspot ${numberOfUniversals}`;
    const universal: Universal = this.propertyBuilder.universal(hotSpotName, '');

    this.getRoomById(roomId).addUniversal(universal);

    this.projectMetaDataInteractor.onProjectChanged();

    return universal;
  }

  removeUniversal(roomId: string, universal: Universal) {
    this.getRoomById(roomId).removeUniversal(universal);
    this.projectMetaDataInteractor.onProjectChanged();
  }

  addDoor(roomId: string): Door {
    const outgoingRoomId = this.getRoomIds().filter(rId => rId !== roomId)[0];
    const outgoingRoomName = this.getRoomById(outgoingRoomId).getName();
    const door: Door = this.propertyBuilder.door(outgoingRoomId, outgoingRoomName);

    // if there are multiple options, let the user decide
    if (this.getRoomIds().length > 2) {
      door.reset();
    }

    this.getRoomById(roomId).addDoor(door);

    this.projectMetaDataInteractor.onProjectChanged();

    return door;
  }

  removeDoor(roomId: string, door: Door) {
    this.getRoomById(roomId).removeDoor(door);
    this.projectMetaDataInteractor.onProjectChanged();
  }

  roomHasBackgroundImage(roomId: string): boolean {
    return this.getRoomById(roomId).hasBackgroundImage();
  }

  getHomeRoomId(): string {
    return this.roomManager.getHomeRoomId();
  }

  isHomeRoom(roomId: string): boolean {
    return roomId === this.roomManager.getHomeRoomId();
  }

  setHomeRoomId(roomId: string) {
    this.roomManager.setHomeRoomId(roomId);
    this.projectMetaDataInteractor.onProjectChanged();
  }

  resetRoomManager() {
    this.roomManager.initValues();
    this.assetManager.clearAssets();
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
      }, new Array<Door>())
      .forEach(door => door.setName(name));

    this.projectMetaDataInteractor.onProjectChanged();
  }
}
