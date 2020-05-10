import { Component, ViewChild } from '@angular/core';

import userInteractor from 'core/user/userInteractor';
import adminInteractor from 'core/admin/adminInteractor';

@Component({
  selector: 'admin',
  styleUrls: ['./admin.scss'],
  templateUrl: './admin.html',
})
export class Admin {

  @ViewChild('adminUserGroups') adminUserGroupsElement;

  private hasPermission(): boolean {
    return userInteractor.isLoggedIn() && adminInteractor.isAdmin();
  }

  private onAddProject($event) {
    this.adminUserGroupsElement.onAddProject($event);
  }

}
