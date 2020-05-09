import { Component, Input } from '@angular/core';
import sceneInteractor from 'core/scene/sceneInteractor';
import { Door } from 'data/scene/entities/door';
import { Universal } from 'data/scene/entities/universal';
import eventBus from 'ui/common/event-bus';

@Component({
  selector: 'action-menu',
  styleUrls: ['./action-menu.scss'],
  templateUrl: './action-menu.html',
})
export class ActionMenu {

  @Input() isOpen: boolean = false;

  public addUniversal() {

    const activeRoomId: string = sceneInteractor.getActiveRoomId();

    try{
      const universal: Universal = sceneInteractor.addUniversal(activeRoomId);
      eventBus.onSelectProperty(universal.getId(), true);
      
    } catch(e) {
      eventBus.onModalMessage('', e)

    }
    
  }

  public addDoor() {
    const numberOfRooms = sceneInteractor.getRoomIds().length;

    if (numberOfRooms < 2) {
      eventBus.onModalMessage('', 'There must be at least two rooms to add a door.');
      return;
    }

    const activeRoomId: string = sceneInteractor.getActiveRoomId();
    const door: Door = sceneInteractor.addDoor(activeRoomId);

    eventBus.onSelectProperty(door.getId(), true);

    // auto open door editor if there are multiple outgoing choices
    if (numberOfRooms > 2) {
      setTimeout(() => {
        eventBus.onSelectProperty(door.getId(), false, true);
      });
    }
  }
}
