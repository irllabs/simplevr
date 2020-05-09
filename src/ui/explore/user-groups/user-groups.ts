import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { GroupInteractor } from 'core/group/groupInteractor';
import { ProjectInteractor } from 'core/project/projectInteractor';
import metaDataInteractor from 'core/scene/projectMetaDataInteractor';
import sceneInteractor from 'core/scene/sceneInteractor';
import { UserInteractor } from 'core/user/userInteractor';
import { ERROR_OPENING_PROJECT, SERVER_ERROR } from 'ui/common/constants';

import eventBus from 'ui/common/event-bus';

@Component({
  selector: 'user-groups',
  styleUrls: ['./user-groups.scss'],
  templateUrl: './user-groups.html',
})
export class UserGroups {

  private projects = {};

  constructor(
    private userInteractor: UserInteractor,
    private groupInteractor: GroupInteractor,
    private projectInteractor: ProjectInteractor,
    private router: Router,
  ) {
  }

  ngAfterViewInit() {
    const userGroups = this.getUserGroups();

    userGroups.forEach(group => this.fetchGroup(group.id));
  }

  private getUserGroups(): any[] {
    return this.userInteractor.getUserGroups();
  }

  public getProjectsByGroup(groupId: string) {
    return this.projects[groupId] || [];
  }

  private fetchGroup(groupId: string) {
    return this.groupInteractor.getGroup(groupId)
      .subscribe(
        userGroup => this.projects[groupId] = userGroup.projects,
        error => console.log('error', error),
      );
  }

  public openProject(project) {

    eventBus.onStartLoading();
    this.projectInteractor.openProject(project)
      .then(
        () => {
          sceneInteractor.setActiveRoomId(null);
          eventBus.onSelectRoom(null, false);
          eventBus.onStopLoading();
          metaDataInteractor.setIsReadOnly(true);
          this.router.navigateByUrl('/editor');
        },
        () => {
          eventBus.onStopLoading();
          eventBus.onModalMessage(ERROR_OPENING_PROJECT, SERVER_ERROR);
        },
      );
  }
}
