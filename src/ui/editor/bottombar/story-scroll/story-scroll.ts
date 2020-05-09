import { Component } from '@angular/core';
import metaDataInteractor from 'core/scene/projectMetaDataInteractor';
import sceneInteractor from 'core/scene/sceneInteractor';
import { Room } from 'data/scene/entities/room';
import { RoomProperty } from 'data/scene/interfaces/roomProperty';
import { resizeImage } from 'data/util/imageResizeService';
import { Subscription } from 'rxjs/Subscription';

import eventBus, { EventType } from 'ui/common/event-bus';
import { SlideshowBuilder } from 'ui/editor/util/slideshowBuilder';
import settingsInteractor from 'core/settings/settingsInteractor';

@Component({
  selector: 'story-scroll',
  styleUrls: ['./story-scroll.scss'],
  templateUrl: './story-scroll.html',
})
export class StoryScroll {

  private activeProperty: RoomProperty;
  private subscriptions: Set<Subscription> = new Set<Subscription>();
  private activeRoomIsExpanded: boolean = true;
  private inspectorIsVisible: boolean = false;
  private isOpen: boolean = false;

  public get roomIds(): string[] {
    return sceneInteractor.getRoomIds();
  }

  public get canAddMoreRooms(){
    return this.roomIds.length < settingsInteractor.settings.maxRooms
  }

  constructor(
    private slideshowBuilder: SlideshowBuilder,
  ) {
  }

  ngOnInit() {
    this.subscribeToEvents();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  private subscribeToEvents() {
    const roomPropertySubscription: Subscription = eventBus.getObservable(EventType.SELECT_PROPERTY)
      .subscribe(
        (observedData) => {
          const propertyId: string = observedData.propertyId;
          const activeRoomId: string = sceneInteractor.getActiveRoomId();

          this.activeProperty =
            sceneInteractor.getPropertyById(activeRoomId, propertyId) ||
            sceneInteractor.getRoomById(activeRoomId);
          this.activeRoomIsExpanded = true;
        },
        error => console.log('error', error),
      );

    const roomSubscription: Subscription = eventBus.getObservable(EventType.SELECT_ROOM)
      .subscribe(
        () => {
          const activeRoomId = sceneInteractor.getActiveRoomId();
          this.activeProperty = sceneInteractor.getRoomById(activeRoomId);
        },
        error => console.log('error', error),
      );

    this.subscriptions.add(roomPropertySubscription);
    this.subscriptions.add(roomSubscription);
  }

  public hasPrevRoomFor(roomId) {
    return this.roomIds.indexOf(roomId) > 0;
  }

  public hasNextRoomFor(roomId) {
    return this.roomIds.indexOf(roomId) < this.roomIds.length - 1;
  }

  public getRoomById(roomId: string): Room {
    return sceneInteractor.getRoomById(roomId);
  }

  public onRoomSelect(roomId: string) {
    const activeRoomId: string = sceneInteractor.getActiveRoomId();

    if (roomId === activeRoomId) {
      this.activeRoomIsExpanded = !this.activeRoomIsExpanded;
    } else {
      this.activeRoomIsExpanded = true;
    }

    sceneInteractor.setActiveRoomId(roomId);
    eventBus.onSelectRoom(roomId, false);
  }

  public roomIsSelected(roomId: string): boolean {
    const numberOfRooms: number = this.roomIds.length;

    if (numberOfRooms === 0) {
      return false;
    }
    return roomId === sceneInteractor.getActiveRoomId();
  }

  public roomIsLoaded(roomId: string): boolean {
    const room: Room = sceneInteractor.getRoomById(roomId);

    return room.isLoadedAssets;
  }

  public roomIsExpanded(roomId: string): boolean {
    return this.roomIsSelected(roomId)
      && this.activeRoomIsExpanded
      && !!sceneInteractor.getRoomProperties(roomId).length;
  }

  public getProjectName(): string {
    return metaDataInteractor.getProjectName();
  }

  public onInfoClick($event) {
    setTimeout(() => this.inspectorIsVisible = true);
  }

  private onOffClick($event) {
    if (this.inspectorIsVisible) {
      this.inspectorIsVisible = false;
    }
  }

  public toggleOpen() {
    this.isOpen = !this.isOpen;
  }

  public onFileLoad($event) {
    const fileName: string = $event.file.name;
    const binaryFileData: any = $event.binaryFileData;
    //const activeRoomId: string = this.sceneInteractor.getActiveRoomId();
    //make UI for 'loading' appear
    eventBus.onStartLoading();
    //make thumbnail, and convert to power of 2 image size
    resizeImage(binaryFileData, 'backgroundImage')
      .then(resized => {
        const newRoomId = sceneInteractor.addRoom();
        const room: Room = sceneInteractor.getRoomById(newRoomId);

        room.setBackgroundImageBinaryData(resized.backgroundImage);
        room.setThumbnail(resized.thumbnail);

        eventBus.onSelectRoom(null, false);
        eventBus.onStopLoading();
      })
      .catch(error => eventBus.onModalMessage('Error', error));
  }

  public onSwapRoom({ roomId, direction }) {
    const room = sceneInteractor.getRoomById(roomId);
    const currentIndex = this.roomIds.indexOf(roomId);

    sceneInteractor.changeRoomPosition(room, currentIndex + direction);
  }

  public addSlideShow($event) {
    eventBus.onStartLoading();
    this.slideshowBuilder.build($event.files)
      .then(resolve => eventBus.onStopLoading())
      .catch(error => eventBus.onModalMessage('error', error));
  }
}
