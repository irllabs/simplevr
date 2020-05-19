import { Component, EventEmitter, Input, NgZone, Output } from '@angular/core';
import sceneInteractor from 'core/scene/sceneInteractor';

import { Room } from 'data/scene/entities/room';

import propertyRemovalService from 'ui/editor/util/propertyRemovalService';
import { RoomPropertyTypeService } from 'ui/editor/util/roomPropertyTypeService';

@Component({
  selector: 'storymap-item',
  styleUrls: ['./storymap-item.scss'],
  templateUrl: './storymap-item.html',
})
export class StorymapItem {

  @Input() roomProperty: Room;
  @Input() isActive: boolean;
  @Input() roomId: string;
  @Input() hasPrevRoom: boolean;
  @Input() hasNextRoom: boolean;
  @Output() moveRoom = new EventEmitter();
  @Output() infoEvent = new EventEmitter();
  @Output() deleteEvent = new EventEmitter();

  private propertyIsRoom: boolean = false;
  private inspectorIsVisible = false;

  constructor(
    protected ngZone: NgZone,
  ) {
  }


  ngOnInit() {
    this.propertyIsRoom = RoomPropertyTypeService.getTypeString(this.roomProperty) === 'room';
  }

  onDeleteClick() {
    if (this.isHomeRoom()) {
      sceneInteractor.setHomeRoomId(null);
    }
    propertyRemovalService.removeProperty(this.roomProperty);
  }

  onInfoClick($event) {
    this.infoEvent.emit();
  }

  onMoveRoom(roomId, direction, enabled) {
    if (enabled) {
      this.moveRoom.emit({ roomId, direction });
    }
  }

  getLabelText() {
    return this.roomProperty.getName();
  }

  onLabelChange($event) {
    if (this.propertyIsRoom) {
      sceneInteractor.setRoomName(this.roomProperty.getId(), $event.text);
    }
    else {
      this.roomProperty.setName($event.text);
    }
  }

  isHomeRoom(): boolean {
    const roomId: string = this.roomProperty.getId();
    return sceneInteractor.isHomeRoom(roomId);
  }

  setAsHomeRoom() {
    const roomId: string = this.roomProperty.getId();
    sceneInteractor.setHomeRoomId(roomId);
  }

  getBackgroundThumbnail(): string {
    const roomId: string = this.roomProperty.getId();
    const room: Room = sceneInteractor.getRoomById(roomId);
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
    return this.roomProperty.getName();
  }

  onNameChange($event) {
    this.roomProperty.setName($event.text);
  }


}
