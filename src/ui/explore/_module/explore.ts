import { Component } from '@angular/core';

import userInteractor from 'core/user/userInteractor';

@Component({
  selector: 'explore',
  styleUrls: ['./explore.scss'],
  templateUrl: './explore.html',
})
export class Explore {
  private hasPermission(): boolean {
    return userInteractor.isLoggedIn();
  }

}
