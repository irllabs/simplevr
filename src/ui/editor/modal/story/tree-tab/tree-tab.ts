import { Component } from '@angular/core';
import metaDataInteractor from 'core/scene/projectMetaDataInteractor';

import sceneInteractor from 'core/scene/sceneInteractor';
import { Room } from 'data/scene/entities/room';
import { RoomProperty } from 'data/scene/interfaces/roomProperty';

import { Subscription } from 'rxjs/Subscription';

import eventBus, { EventType } from 'ui/common/event-bus';

@Component({
  selector: 'tree-tab',
  styleUrls: ['./tree-tab.scss'],
  templateUrl: './tree-tab.html',
})
export class TreeTab {

  private projectIsSelected: boolean = true;
  private activeProperty: RoomProperty;
  private subscriptions: Set<Subscription> = new Set<Subscription>();
  private activeRoomIsExpanded: boolean = true;

  ngOnInit() {
    this.subscribeToEvents();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  private subscribeToEvents() {
    const roomPropertySubscription: Subscription = eventBus.getObservable(EventType.SELECT_PROPERTY)
      .subscribe(
        observedData => {
          const propertyId: string = observedData.propertyId;
          const activeRoomId: string = sceneInteractor.getActiveRoomId();
          this.activeProperty =
            sceneInteractor.getPropertyById(activeRoomId, propertyId) ||
            sceneInteractor.getRoomById(activeRoomId);
          this.projectIsSelected = false;
          this.activeRoomIsExpanded = true;
        },
        error => console.log('error', error),
      );

    const roomSubscription: Subscription = eventBus.getObservable(EventType.SELECT_ROOM)
      .subscribe(
        observedData => {
          const activeRoomId = sceneInteractor.getActiveRoomId();
          this.activeProperty = sceneInteractor.getRoomById(activeRoomId);
          this.projectIsSelected = false;
        },
        error => console.log('error', error),
      );

    this.subscriptions.add(roomPropertySubscription);
    this.subscriptions.add(roomSubscription);
  }

  onProjectSelect() {
    this.projectIsSelected = true;
  }

  getPropertyList(): RoomProperty[] {
    const activeRoomId: string = sceneInteractor.getActiveRoomId();
    return sceneInteractor.getRoomProperties(activeRoomId);
  }

  getRoomIdList(): string[] {
    return sceneInteractor.getRoomIds();
  }

  getRoomById(roomId: string): Room {
    return sceneInteractor.getRoomById(roomId);
  }

  onRoomSelect(roomId: string) {
    const activeRoomId: string = sceneInteractor.getActiveRoomId();
    if (roomId === activeRoomId) {
      this.activeRoomIsExpanded = !this.activeRoomIsExpanded;
    }
    else {
      this.activeRoomIsExpanded = true;
    }
    sceneInteractor.setActiveRoomId(roomId);
    eventBus.onSelectRoom(roomId, false);
  }

  onPropertySelect(roomProperty: RoomProperty) {
    const propertyId: string = roomProperty && roomProperty.getId() || null;
    eventBus.onSelectProperty(propertyId, false);
  }

  propertyIsSelected(item): boolean {
    return item === this.activeProperty;
  }

  roomIsSelected(roomId: string): boolean {
    const numberOfRooms: number = sceneInteractor.getRoomIds().length;
    if (numberOfRooms === 0) {
      return false;
    }
    return roomId === sceneInteractor.getActiveRoomId();
  }

  roomIsExpanded(roomId: string): boolean {
    return this.roomIsSelected(roomId)
      && this.activeRoomIsExpanded
      && !!sceneInteractor.getRoomProperties(roomId).length;
  }

  getProjectName(): string {
    return metaDataInteractor.getProjectName();
  }

}
