import { Injectable } from '@angular/core';

import sceneInteractor from 'core/scene/sceneInteractor';
import { Door } from 'data/scene/entities/door';

import { Universal } from 'data/scene/entities/universal';
import { RoomProperty } from 'data/scene/interfaces/roomProperty';
import eventBus from 'ui/common/event-bus';
import { RoomPropertyTypeService } from 'ui/editor/util/roomPropertyTypeService';


@Injectable()
export class PropertyRemovalService {
  removeProperty(roomProperty: RoomProperty) {
    const propertyType: string = RoomPropertyTypeService.getTypeString(roomProperty);
    this.removePropertyStrategy(propertyType, roomProperty);
  }

  private removePropertyStrategy(propertyType: string, roomProperty: RoomProperty) {
    const roomId = sceneInteractor.getActiveRoomId();
    const removalStrategy = {
      door: () => {
        const door: Door = <Door> roomProperty;
        sceneInteractor.removeDoor(roomId, door);
        this.onDeselect();
      },
      room: () => {
        const removeRoomId: string = roomProperty.getId();
        sceneInteractor.removeRoom(removeRoomId);

        const activeRoomId: string = sceneInteractor.getActiveRoomId();
        eventBus.onSelectRoom(activeRoomId, false);
      },
      universal: () => {
        const universal: Universal = <Universal> roomProperty;
        sceneInteractor.removeUniversal(roomId, universal);
        this.onDeselect();
      },
    };
    removalStrategy[propertyType]();
  }

  private onDeselect() {
    eventBus.onSelectProperty(null, false);
    eventBus.onHotspotVisibility(false);
  }
}
