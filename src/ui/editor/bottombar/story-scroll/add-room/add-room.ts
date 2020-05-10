import { Component } from '@angular/core';
import { Router } from '@angular/router';
import userInteractor from 'core/user/userInteractor';
import eventBus from 'ui/common/event-bus';

@Component({
  selector: 'add-room',
  styleUrls: ['./add-room.scss'],
  templateUrl: './add-room.html',
})
export class AddRoomButton {
  public hasSwapButtons: boolean = false;

  constructor(
    private router: Router,
  ) {
  }

  addRoom() {
    if (!userInteractor.isLoggedIn()) {
      eventBus.onModalMessage('Error', 'You must be logged in to create more rooms');
      return;
    }

    this.router.navigate(['/editor', { outlets: { 'modal': 'upload' } }]);
  }
}
