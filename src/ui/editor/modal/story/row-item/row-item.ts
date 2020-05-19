import { Component, Input } from '@angular/core';
import sceneInteractor from 'core/scene/sceneInteractor';

import { Room } from 'data/scene/entities/room';
import { RoomProperty } from 'data/scene/interfaces/roomProperty';

import propertyRemovalService from 'ui/editor/util/propertyRemovalService';
import { RoomPropertyTypeService } from 'ui/editor/util/roomPropertyTypeService';


@Component({
  selector: 'row-item',
  styleUrls: ['./row-item.scss'],
  templateUrl: './row-item.html',
})
export class RowItem {

  @Input() roomProperty: RoomProperty;
  @Input() caretIsExpanded: boolean;
  @Input() isActive: boolean;

  private propertyIsRoom: boolean = false;

  ngOnInit() {
    this.propertyIsRoom = RoomPropertyTypeService.getTypeString(this.roomProperty) === 'room';
  }

  onDeleteClick() {
    if (this.isHomeRoom()) {
      sceneInteractor.setHomeRoomId(null);
    }
    propertyRemovalService.removeProperty(this.roomProperty);
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

}
